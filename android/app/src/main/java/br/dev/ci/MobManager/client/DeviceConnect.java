package br.dev.ci.MobManager.client;

import android.os.AsyncTask;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.net.ssl.HostnameVerifier;

import br.dev.ci.MobManager.client.model.Device;
import br.dev.ci.MobManager.client.model.GatewayConnection;


public class DeviceConnect extends AsyncTask<Device, Void, String> {
    private ObjectMapper mapper = new ObjectMapper();
    private GatewayConnection url_gateway;
    public DeviceConnect(GatewayConnection url_gateway) {
        this.url_gateway = url_gateway;
        this.url_gateway.setConnect(this);
    }
    @Override
    protected String doInBackground(Device... devices) {
        try {
            URL url = new URL(this.url_gateway.getUrl() + "Device/Connect");

            HostnameVerifier hostnameVerifier = org.apache.http.conn.ssl.SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER;
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.getHost
            // connection.set
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            // connection.setRequestProperty("Accept", "application/json");
            OutputStreamWriter outputStreamWriter = new OutputStreamWriter(connection.getOutputStream());

            outputStreamWriter.write(mapper.writeValueAsString(devices[0]));
            outputStreamWriter.flush();

            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(connection.getInputStream(), "utf-8"))) {
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
