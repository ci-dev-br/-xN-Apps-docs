package br.dev.ci.mobmanager.client;

import android.os.AsyncTask;

import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
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
    @Override
    protected String doInBackground(Device... devices) {
        try {
            URL url = new URL(this.url_gateway.getUrl() + "Device/Connect");

            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "application/json");
            OutputStreamWriter outputStreamWriter = new OutputStreamWriter(connection.getOutputStream());

            outputStreamWriter.write(mapper.toJson(devices[0]));
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
