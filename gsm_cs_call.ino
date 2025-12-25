#include <HardwareSerial.h>

HardwareSerial gsm(2);   // Use Serial2

String phoneNumber = "+919677585698";   // Replace with your number

void setup() {
  Serial.begin(115200);
  gsm.begin(9600, SERIAL_8N1, 16, 17);  // RX=16, TX=17

  delay(3000);
  Serial.println("Initializing GSM...");

  sendCommand("AT");
  sendCommand("AT+CMGF=1");   // SMS text mode
}

void loop() {
  sendSMS("Vehicle Alert! GSM module working.");
  delay(5000);

  makeCall();
  delay(20000);   // Call duration

  hangCall();
  while (1);      // Stop repeating
}

void sendSMS(String message) {
  gsm.println("AT+CMGS=\"" + phoneNumber + "\"");
  delay(1000);
  gsm.print(message);
  delay(500);
  gsm.write(26);   // CTRL+Z
  delay(5000);
  Serial.println("SMS Sent");
}

void makeCall() {
  gsm.println("ATD" + phoneNumber + ";");
  Serial.println("Calling...");
}

void hangCall() {
  gsm.println("ATH");
  Serial.println("Call Ended");
}

void sendCommand(String cmd) {
  gsm.println(cmd);
  delay(1000);
  while (gsm.available()) {
    Serial.write(gsm.read());
  }
}
