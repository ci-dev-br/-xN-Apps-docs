package br.dev.ci.MobManager.client;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.AsyncTask;
import android.webkit.PermissionRequest;


import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.NetworkInterface;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import br.dev.ci.MobManager.MainActivity;

public class ManagerClient {
    private MainActivity mainActivity;
    private static ManagerClient _instance = new ManagerClient();
    public static ManagerClient getInstance(){
        return ManagerClient._instance;
    }

    public void setMainActivity(MainActivity mainActivity) {this.mainActivity = mainActivity;}
    List<String> gateways;

    public void addGateway(String url) {
        if(gateways == null) gateways = new ArrayList<>();
        this.gateways.add(url);
        this.connect(url);
    }

    public List<String> getGateways(){
        return this.gateways;
    }

    private void connect(String gateway_url){
        try {
            DeviceConnect dc = new DeviceConnect(gateway_url);
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("applicationId", "e60e2ed1-e318-4f38-bdcd-2fceb3d0315d");
            jsonObject.put("id", this.getMacAddr());
            String jsonString = jsonObject.toString();
            dc.execute(jsonString);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    private  String getMacAddr() {
        try {
            List<NetworkInterface> all = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface nif : all) {
                if (!nif.getName().equalsIgnoreCase("wlan0")) continue;

                byte[] macBytes = nif.getHardwareAddress();
                if (macBytes == null) {
                    return "";
                }

                StringBuilder res1 = new StringBuilder();
                for (byte b : macBytes) {
                    res1.append(Integer.toHexString(b & 0xFF) + ":");
                }

                if (res1.length() > 0) {
                    res1.deleteCharAt(res1.length() - 1);
                }
                return res1.toString();
            }
        } catch (Exception ex) {
            //handle exception
        }
        return "";
    }
}

class DeviceConnect extends AsyncTask<String, Void, String>{
    private String url_gateway;
    public DeviceConnect(String url_gateway){
            this.url_gateway = url_gateway;
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