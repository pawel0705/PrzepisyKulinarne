# PrzepisyKulinarne
Aplikacja webowa, w której można umieszczać własne przepisy kulinarne.

## Opis projektu

Strona umożliwia umieszczanie przepisów, przeglądanie, komentowanie, ocenianie. Użytkownik bez konta, ma możliwość jedynie ich przeglądania. Użytkownik może posiadać swój własny profil, na którym zamieszczane są informacje na temat jego przepisów (ilość wyświetleń, ocena, komentarze). Dostępny jest również prywatny czat, by móc popisać z innym użytkownikiem. Na głównej stronie znajdują się najnowsze przepisy zamieszczone przez różnych użytkowników. Można je sortować i filtrować w zależności od dostępnych ustawień.

## Wykorzystane technologie

- Python 3.x - język wysokiego poziomu, backend
- Django 3.x - darmowy i open-source’owy framework do tworzenia aplikacji webowych w Pythonie. Został użyty do utworzenia i zarządzania ustawieniami serwera, jak i jego pracą. Posłużył do tworzenia modeli bazodanowych, API.
- SQLite - baza danych, przechowująca informacje o użytkownikach i przepisach
- Angular - kompleksowy framework do tworzenia aplikacji typu SPA (Single Page Application). Obejmuje narzędzia do obsługi routingu, umożliwia szybkie tworzenie widoków interfejsu użytkownika. Używa TypeScript, którego główną zaletą jest utrzymanie czystego i zrozumiałego kodu.
- Bootstrap - Biblioteka do budowania wizualnej części stron internetowych.

## Uruchomienie aplikacji

- W celu uruchomienia serwera należy przejść do folderu recipesAPI i wywołanie komendy w konsoli:

python manage.py runserver

- W celu uruchomienia aplikacji klienckiej (przeglądarki) należy przejść do folderu ClientApp i uruchomić komendę w konsoli:

ng serve --open

## Wygląd aplikacji

<p align="center">
<br>
<img src="/images/Screenshot_1.png" width="50%"/>
<img src="/images/Screenshot_2.png" width="50%"/>
<img src="/images/Screenshot_3.png" width="50%"/>
<img src="/images/Screenshot_4.png" width="50%"/>
</p>

## Współautorstwo

[Michal-Jankowski](https://github.com/Michal-Jankowski)

[jackies-o](https://github.com/jackies-o)

### Oryginalne repozytorium
[Oryginalne repozytorium](https://github.com/jackies-o/polsl_mgr_obierki)
