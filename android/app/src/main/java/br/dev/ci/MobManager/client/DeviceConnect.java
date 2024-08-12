package br.dev.ci.MobManager.client;

import android.os.AsyncTask;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import br.dev.ci.MobManager.client.model.GatewayConnection;


public class DeviceConnect extends AsyncTask<String, Void, String> {
    private GatewayConnection url_gateway;
    public DeviceConnect(GatewayConnection url_gateway) {
        this.url_gateway = url_gateway;
        this.url_gateway.setConnect(this);
    }
    @Override
    protected String doInBackground(String... strings) {
        try {
            URL url = new URL(this.url_gateway + "api/Device/Connect");
            HttpURLConnection client = (HttpURLConnection) url.openConnection();
            client.setRequestMethod("POST");
            client.setRequestProperty("Content-Type", "application/json");
            client.setRequestProperty("Accept", "application/json");
            client.setDoOutput(true);
            try (OutputStream os = client.getOutputStream()) {
                byte[] input = strings[0].getBytes("utf-8");
                os.write(input, 0, input.length);
            }
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(client.getInputStream(), "utf-8"))) {
                StringBuilder response = new StringBuilder();
                String responseLine = null;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
