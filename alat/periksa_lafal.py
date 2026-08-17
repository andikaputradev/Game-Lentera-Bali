#!/usr/bin/env python3
"""Dengarkan ulang klip kruna yang ejaannya diubah, lalu putuskan lolos/tidak.

Dua hal yang ditanyakan ke pendengar, tiga kali per klip lalu diambil suara
terbanyak:
  1. vokal akhirnya [a] atau pepet [ə]?      -> tujuan kaidah eja-ulang
  2. ada bunyi bahasa Inggris?               -> bahaya 'ica'->'ice'

Klip yang gagal dilaporkan supaya kata itu dimasukkan ke JANGAN_EJA_ULANG di
gen_tts.js dan dibangkitkan ulang dengan ejaan aslinya. Daftar itu tumbuh dari
hasil pengukuran, bukan dari firasat.
"""
import base64
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import uji_lafal as U

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

AUDIO = r'C:\Users\DIMAS\Documents\Claude\Game-Lentera-Bali\audio'
HTML = r'C:\Users\DIMAS\Documents\Claude\Game-Lentera-Bali\index.html'

SKEMA = {
    'type': 'OBJECT',
    'properties': {
        'vokal_akhir': {'type': 'STRING', 'enum': ['A', 'B', 'tidak jelas']},
        'bunyi_inggris': {'type': 'BOOLEAN'},
        'terdengar': {'type': 'STRING'},
    },
    'required': ['vokal_akhir', 'bunyi_inggris', 'terdengar'],
}


def tanya(kata, sasaran):
    return (
        f'Rekaman ini mengucapkan "{kata}" (basa Bali) dua kali. Jawab dari '
        f'BUNYI, bukan dari ejaan.\n\n'
        f'- vokal_akhir: dengarkan KATA "{sasaran}" saja, abaikan kata lain. '
        f'Bunyi vokal TERAKHIR pada kata itu, A atau B?\n'
        f'    A = seperti a pada "ada" (terbuka, jelas)\n'
        f'    B = seperti e pada "besar" (pepet, lemah)\n'
        f'- bunyi_inggris: true kalau ADA kata yang dilafalkan dengan bunyi '
        f'bahasa Inggris (misal terdengar "pyur", "beis", "ais")\n'
        f'- terdengar: tulis apa yang kamu dengar')


def dengar_mp3(jalur, pertanyaan, skema, n=3):
    b64 = base64.b64encode(open(jalur, 'rb').read()).decode()
    badan = {
        'contents': [{'parts': [
            {'text': pertanyaan},
            {'inline_data': {'mime_type': 'audio/mpeg', 'data': b64}}]}],
        'generationConfig': {'temperature': 0.1,
                             'responseMimeType': 'application/json',
                             'responseSchema': skema}}
    keluar = []
    for _ in range(n):
        galat = None
        for _ in range(len(U.KUNCI) * 2):
            k = U.KUNCI[U._giliran[0] % len(U.KUNCI)]
            U._giliran[0] += 1
            url = (f'https://generativelanguage.googleapis.com/v1beta/models/'
                   f'{U.MODEL_DENGAR}:generateContent?key={k}')
            try:
                d = U._post(url, badan)
                keluar.append(json.loads(
                    d['candidates'][0]['content']['parts'][0]['text']))
                break
            except Exception as e:
                galat = str(e)[:80]
        else:
            raise RuntimeError('dengar gagal: ' + str(galat))
    return keluar


def kruna_diubah():
    """Kruna yang ejaannya berubah -> hanya ini yang perlu diperiksa."""
    s = io.open(HTML, encoding='utf-8').read()
    out = []
    for m in re.finditer(r"\{\s*bali:\s*'([^']+)'[^}]*?au:\s*'([^']+)'", s):
        bali, au = m.group(1), m.group(2)
        ubah = re.sub(r"[A-Za-zÀ-ÿ']+",
                      lambda w: w.group(0)[:-1] + 'e'
                      if len(w.group(0)) > 2 and w.group(0).endswith('a')
                      else w.group(0), bali)
        if ubah != bali:
            # kata MANA yang berubah -> itu sasaran pertanyaan. Untuk
            # "Pure Tanah Lot" yang dinilai harus "Pure", padahal klipnya
            # berakhir di "Lot": salah tanya, salah kesimpulan.
            sasaran = next(b for a_, b in zip(bali.split(), ubah.split())
                           if a_ != b)
            out.append({'bali': bali, 'ucap': ubah, 'sasaran': sasaran,
                        'file': f'kata-{au}.mp3'})
    return out


def main():
    daftar = kruna_diubah()
    print(f'{len(daftar)} kruna berubah ejaannya, diperiksa satu per satu\n')
    lolos, gagal = [], []
    for k in daftar:
        p = os.path.join(AUDIO, k['file'])
        if not os.path.exists(p):
            print(f'{k["bali"]:22s} berkas belum ada, dilewati')
            continue
        try:
            j = dengar_mp3(p, tanya(k['ucap'], k['sasaran']), SKEMA)
            v = [x['vokal_akhir'] for x in j]
            ing = sum(1 for x in j if x['bunyi_inggris'])
            pepet = v.count('B') >= 2
            ok = pepet and ing < 2
            (lolos if ok else gagal).append(k)
            print(f'{k["bali"]:16s} kata diuji: {k["sasaran"]:11s} suara={"".join(v):5s} '
                  f'inggris={ing}/3  {"LOLOS" if ok else "GAGAL"}'
                  f'   "{j[0]["terdengar"][:28]}"', flush=True)
        except Exception as e:
            print(f'{k["bali"]:22s} GALAT {str(e)[:70]}', flush=True)
    print(f'\nlolos {len(lolos)}/{len(lolos)+len(gagal)}')
    if gagal:
        print('kembalikan ke ejaan asli:',
              ', '.join(f'{g["bali"]} ({g["ucap"].lower()})' for g in gagal))
    json.dump({'lolos': lolos, 'gagal': gagal},
              io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                   'periksa-kruna.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
