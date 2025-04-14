package br.dev.ci.mobmanager.client;

import android.os.AsyncTask;

import androidx.annotation.NonNull;

import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import br.dev.ci.mobmanager.MainActivity;
import br.dev.ci.mobmanager.client.model.Device;
import br.dev.ci.mobmanager.client.model.GatewayConnection;
/**
 * Device Connect - Gerenciador de Conexão com a Aplicação Servidora
 *
 * Conecte o aplicativo com a aplicação Gateway e intercale os
 * serviços entre smartphone e servidor
 */
public class DeviceConnect extends AsyncTask<Device, Void, String> {
    private final MainActivity mainActivity;    /**
     *   Gson gson = new Gson();
     *   Pessoa pessoa = gson.fromJson(jsonString, Pessoa.class);
     */
    private GatewayConnection url_gateway;
    public DeviceConnect(GatewayConnection url_gateway, MainActivity mainActivity) {
        this.url_gateway = url_gateway;
        this.url_gateway.setConnect(this);
        this.mainActivity = mainActivity;
    }
    public String status;

    @Override
    protected String doInBackground(Device... devices) {
        try {
            for (Device devide :devices) {
                ConnectDevice(devide);
            }
            return "OK";
        }catch (Exception ex){
            ex.printStackTrace();
        }
        return null;
    }
    private void ConnectDevice(Device device){
        try {
            String response = this.Post(this.url_gateway.getUrl() + "Device/Connect",device, Device.class);

            Gson mapper = new Gson();
            Device device_response = mapper.fromJson(response, Device.class);
            device.setId(device_response.getId());

            // TODO: extract to handler for set text into message text, motivation: the call is illegal;
            // if(this.mainActivity != null) this.mainActivity.getMessage().setText("Dispositivo Identificado");
        } catch (Exception ex) {
            ex.printStackTrace();
            // TODO: extract to handler for set text into message text, motivation: the call is illegal;
            // if(this.mainActivity != null ) this.mainActivity.getMessage().setText(ex.getMessage());
        }
    }
    private String Post(String url, Object data, Class data_class){
        URL url_request = null;
        try {
            url_request = new URL(url);
            if (url_request == null) return null;
            HttpURLConnection connection = (HttpURLConnection) url_request.openConnection();
            try {
                connection.setRequestMethod("POST");
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "application/json");
            if(data != null){
                try (DataOutputStream os = new DataOutputStream(connection.getOutputStream())) {
                    String data_string_json = this.readAsStringJson(data,data_class);
                    os.writeBytes(data_string_json);
                    os.flush();
                }
            }
            String response_json = getResponseAsStringJson(connection);
            connection.disconnect();
            return response_json;
        }catch (Exception ex){
            ex.printStackTrace();
            if(mainActivity != null) mainActivity.getMessage().setText(ex.getMessage());
        }
        return null;
    }

    private String readAsStringJson(Object data, Class data_class){
        Gson mapper = new Gson();
        return mapper.toJson(data, data_class);
    }

    @NonNull
    private static String getResponseAsStringJson(HttpURLConnection connection) throws Exception {
        int responseCode = connection.getResponseCode();
        String response_json = null;
        if (responseCode == HttpURLConnection.HTTP_CREATED) {
            StringBuilder response = new StringBuilder();
            try (
                    BufferedReader reader = new BufferedReader( new InputStreamReader( connection.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
            }
            response_json = response.toString();
        }
        else {
            throw new Exception("Error: HTTP Response code - " + responseCode);
        }
        return response_json;
    }
}
