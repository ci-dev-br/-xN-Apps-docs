package br.dev.ci.mobilemanger.client;

import android.os.AsyncTask;

import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import br.dev.ci.mobilemanger.MainActivity;
import br.dev.ci.mobilemanger.client.model.Device;
import br.dev.ci.mobilemanger.client.model.GatewayConnection;
import br.dev.ci.mobilemanger.client.model.PhoneNumber;

public class ManagerClient {
    private MainActivity mainActivity;
    private List<DeviceConnect> connections = new ArrayList<>();
    private static ManagerClient _instance = new ManagerClient();
    private List<PhoneNumber> phones;
    public List<PhoneNumber> getPhones() {
        return phones;
    }
    public List<DeviceConnect> getConnections() {
        return connections;
    }
    public MainActivity getMainActivity() {
        return mainActivity;
    }
    public void setMainActivity(MainActivity mainActivity) {
        this.mainActivity = mainActivity;
    }
    public void setPhones(List<PhoneNumber> phones) {
        this.phones = phones;
    }
    public static ManagerClient getInstance(){
        return ManagerClient._instance;
    }
    private AsyncTask<Device, Void, String> task;
    List<GatewayConnection> gateways;
    public AsyncTask<Device, Void, String> getTask() {
        return this.task;
    }
    public AsyncTask<Device, Void, String> setupNewGateway(String url, String ws) {
        GatewayConnection gateway_connection = new GatewayConnection(){{
            if(url != null) setUrl(url);
            if(ws != null) setWs(ws);
            if(mainActivity != null) setMainActivity(mainActivity);
        }};
        this.getGateways().add(gateway_connection);
        this.task = this.connect(gateway_connection);
        return this.task;
    }
    public List<GatewayConnection> getGateways(){
        if(gateways == null) gateways = new ArrayList<>();
        return this.gateways;
    }
    private AsyncTask<Device, Void, String> connect(GatewayConnection connection){
        DeviceConnect device_connection = new DeviceConnect(connection,this.getMainActivity());
        connections.add(device_connection);
        Device device = new Device(){{
            setMac(getMacAddr());
            setApplicationId("e60e2ed1-e318-4f38-bdcd-2fceb3d0315d");
            setName("MobManager-KitKat");
            setNumbers(getPhones());
        }};
        return device_connection.execute(device);
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
