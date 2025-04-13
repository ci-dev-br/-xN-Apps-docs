package br.dev.ci.mobmanager.client;

import android.os.AsyncTask;
import com.google.gson.Gson;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import br.dev.ci.mobmanager.client.model.Device;
import br.dev.ci.mobmanager.client.model.GatewayConnection;

/**
 * Device Connect - Gerenciador de Conexão com a Aplicação Servidora
 *
 * Conecte o aplicativo com a aplicação Gateway e intercale os
 * serviços entre smartphone e servidor
 */
public class DeviceConnect extends AsyncTask<Device, Void, String> {
    /**
     *   Gson gson = new Gson();
     *   Pessoa pessoa = gson.fromJson(jsonString, Pessoa.class);
     */
    private Gson mapper = new Gson();
    private GatewayConnection url_gateway;
    public DeviceConnect(GatewayConnection url_gateway) {
        this.url_gateway = url_gateway;
        this.url_gateway.setConnect(this);
    }
    public String status;
    @Override
    protected String doInBackground(Device... devices) {
        try {
            URL url = new URL(this.url_gateway.getUrl() + "Device/Connect");

            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            // connection.setRequestProperty("Accept", "application/json");
            // connection.setReadTimeout(60000);
            // connection.setConnectTimeout(60000);

            try (DataOutputStream os = new DataOutputStream(connection.getOutputStream())) {
                Device device = devices[0];

                String devive_payload = mapper.toJson(device);

                os.writeBytes(devive_payload);
                os.flush();
            }
            int responseCode = connection.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) {
                // HTTP_OK or 200 response code generally means that the server ran successfully without any errors
                StringBuilder response = new StringBuilder();

                // Read response content
                // connection.getInputStream() purpose is to obtain an input stream for reading the server's response.
                try (
                        BufferedReader reader = new BufferedReader( new InputStreamReader( connection.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line); // Adds every line to response till the end of file.
                    }
                }
                System.out.println("Response: " + response.toString());
            }
            else {
                System.out.println("Error: HTTP Response code - " + responseCode);
            }
            /*try (BufferedReader buffered_reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), "utf-8"))) {
                StringBuilder response = new StringBuilder();
                String responseLine = null;
                while ((responseLine = buffered_reader.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            } *//* catch (Exception ex){
                ex.printStackTrace();
            }*/
            connection.disconnect();
            status = "OK";
        } catch (IOException ex){
            ex.printStackTrace();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }
}
