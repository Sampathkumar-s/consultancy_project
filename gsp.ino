#include <TinyGPSPlus.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>

/* ---------- GPS ---------- */
#define GPS_RX 16   // connect GPS TXD here
#define GPS_TX 17   // connect GPS RXD here (optional)

TinyGPSPlus gps;

/* ---------- WiFi ---------- */
#define WIFI_SSID     "POCO C55"
#define WIFI_PASSWORD "sampathkumar"

/* ---------- Firebase ---------- */
#define API_KEY       ""
#define DATABASE_URL  "https://your-project-id-default-rtdb.firebaseio.com/"
#define DEVICE_ID     "device_01"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

/* ---------- Timing ---------- */
static unsigned long last = 0;

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial.println("GY-GPS6MV2 (NEO-6M) - waiting for fix...");

  /* WiFi Connect */
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi Connected");

  /* Firebase Setup */
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Firebase Connected");
}

void loop() {
  while (Serial2.available()) {
    gps.encode(Serial2.read());
  }

  if (millis() - last >= 1000) {
    last = millis();

    String basePath = "/devices/" DEVICE_ID;

    if (gps.location.isValid()) {

      /* ---- YOUR ORIGINAL SERIAL PRINTS (UNCHANGED) ---- */
      Serial.print("Lat: ");
      Serial.print(gps.location.lat(), 6);
      Serial.print("  Lon: ");
      Serial.print(gps.location.lng(), 6);
      Serial.print("  Sats: ");
      Serial.print(gps.satellites.value());
      Serial.print("  Alt(m): ");
      Serial.print(gps.altitude.meters());

      /* ---- SPEED ADDED ---- */
      Serial.print("  Speed(kmph): ");
      Serial.println(gps.speed.kmph());

      /* ---- FIREBASE UPLOAD ---- */
      Firebase.RTDB.setDouble(&fbdo, basePath + "/latitude", gps.location.lat());
      Firebase.RTDB.setDouble(&fbdo, basePath + "/longitude", gps.location.lng());
      Firebase.RTDB.setFloat(&fbdo, basePath + "/speed_kmph", gps.speed.kmph());
      Firebase.RTDB.setFloat(&fbdo, basePath + "/altitude_m", gps.altitude.meters());
      Firebase.RTDB.setInt(&fbdo, basePath + "/satellites", gps.satellites.value());
      Firebase.RTDB.setFloat(&fbdo, basePath + "/hdop", gps.hdop.value() / 100.0);
      Firebase.RTDB.setInt(&fbdo, basePath + "/last_update", millis());

    } else {

      /* ---- YOUR ORIGINAL NO-FIX CODE (UNCHANGED) ---- */
      Serial.print("No fix yet | Sats=");
      Serial.print(gps.satellites.value());
      Serial.print(" | HDOP=");
      Serial.println(gps.hdop.value() / 100.0);
    }
  }
}
