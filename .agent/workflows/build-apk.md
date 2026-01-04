# Vytvoření APK pro CamMap

Tento návod popisuje, jak vytvořit APK soubor pro instalaci na Android zařízení.

## Předpoklady

- Android Studio nainstalované
- Java JDK 17+
- Android SDK

## Kroky pro vytvoření APK

### 1. Otevřete Android Studio

Spusťte Android Studio a počkejte na načtení.

### 2. Otevřete Android projekt

1. Zvolte **File > Open**
2. Navigujte do: `C:\Users\mirek\Desktop\AntiGravity\CamMap\android`
3. Klikněte **OK** a počkejte na sync Gradle

### 3. Build APK (Debug verze)

1. Zvolte **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Počkejte na dokončení buildu
3. Po dokončení klikněte na **locate** v notifikaci
4. APK najdete v: `android\app\build\outputs\apk\debug\app-debug.apk`

### 4. Build APK (Release verze - podepsaná)

Pro distribuci potřebujete podepsanou APK:

1. Zvolte **Build > Generate Signed Bundle / APK**
2. Vyberte **APK** a klikněte **Next**
3. Vytvořte nový keystore nebo použijte existující:
   - Klikněte **Create new...**
   - Vyplňte cestu k souboru (např. `cammap-release.jks`)
   - Nastavte hesla a údaje
4. Vyberte **release** build variant
5. Zaškrtněte **V1 (Jar Signature)** a **V2 (Full APK Signature)**
6. Klikněte **Finish**

Release APK bude v: `android\app\build\outputs\apk\release\app-release.apk`

## Alternativa: Build přes příkazovou řádku

```bash
cd android
./gradlew assembleDebug
```

APK bude v: `app/build/outputs/apk/debug/app-debug.apk`

## Instalace APK na telefon

1. Přeneste APK na telefon (USB, email, cloud)
2. Na telefonu povolte instalaci z neznámých zdrojů
3. Otevřete APK soubor a nainstalujte
