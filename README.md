# YourVoice

**YourVoice** je interaktivni forum, zasnovan za izmenjavo informacij in povezovanje uporabnikov. Prijavljenim uporabnikom omogoča objavljanje, komentiranje in ocenjevanje vsebine drugih uporabnikov ter urejanje svojega profila.

Prijavljeni uporabniki lahko aktivno sodelujejo pri predlogih in ocenjevanju izboljšav spletnega foruma. Neprijavljenim uporabnikom je omogočeno le brskanje po objavah, brez možnosti interakcije.

Med ključne funkcionalnosti foruma sodijo:

- Napredno iskanje, filtriranje in sortiranje objav.
- Pravice in posebne funkcionalnosti za moderatorje in administratorje.
- Možnost urejanja uporabniškega profila.
- Interaktivne funkcionalnosti za objavljanje, komentiranje in ocenjevanje.

## Tehnologija

Za razvoj foruma je uporabljen **MERN** sklad, ki vključuje:

- **MongoDB** za podatkovno bazo.
- **Express.js** kot backend aplikacijski okvir.
- **React.js** za frontend.
- **Node.js** kot strežniška platforma.

## Namestitev

Za namestitev projekta sledite tem korakom:

1. Klonirajte repozitorij:
   ```bash
   git clone https://github.com/mlukee/YourVoice
   cd YourVoice

2. Namestite odvisnosti za zaledni del:
   ```bash
   cd backend
   npm install

3. Ustvarite ali se prijavite v vaš račun na MongoDB Atlas kjer pridobite uporabniško ime ter geslo za dostop do clusterja
4. Kopirajte `.env.example` datoteko, ter odstranite končnico. Nato vnesite svojo uporabniško ime in geslo za povezavo do vaše podatkovne baze.
5. Zaženite zaledni del:
   ```bash
   npm start
 
6. Namestite odvisnosti za čelni del ter ga zaženite:
   ```bash
   cd ../frontend
   npm install
   npm start
7. Aplikacija se sedaj pripravljena za uporabo!

