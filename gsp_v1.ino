#include <TinyGPSPlus.h>

#define GPS_RX 16   // connect GPS TXD here
#define GPS_TX 17   // connect GPS RXD here (optional)

TinyGPSPlus gps;

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  Serial.println("GY-GPS6MV2 (NEO-6M) - waiting for fix...");
}

void loop() {
  while (Serial2.available()) {
    gps.encode(Serial2.read());
  }

  static unsigned long last = 0;
  if (millis() - last >= 1000) {
    last = millis();

    if (gps.location.isValid()) {
      Serial.print("Lat: ");
      Serial.print(gps.location.lat(), 6);
      Serial.print("  Lon: ");
      Serial.print(gps.location.lng(), 6);
      Serial.print("  Sats: ");
      Serial.print(gps.satellites.value());
      Serial.print("  Alt(m): ");
      Serial.println(gps.altitude.meters());
    } else {
      Serial.print("No fix yet | Sats=");
      Serial.print(gps.satellites.value());
      Serial.print(" | HDOP=");
      Serial.println(gps.hdop.value() / 100.0);
    }
  }
}