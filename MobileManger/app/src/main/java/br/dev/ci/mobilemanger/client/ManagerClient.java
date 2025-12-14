package br.dev.ci.mobilemanger.client;

import android.os.AsyncTask;
import android.os.Build;

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
    private ArrayList<PhoneNumber> phones;
    public ArrayList<PhoneNumber> getPhones() {
        if(phones == null) {
            phones = new ArrayList<>();
        }
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
    public void setPhones(ArrayList<PhoneNumber> phones) {
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
    public GatewayConnection prepare(String url, String ws){
        GatewayConnection gateway_connection = new GatewayConnection();
        gateway_connection.setUrl(url);
        gateway_connection.setWs(ws);
        this.getGateways().add(gateway_connection);
        return gateway_connection;
    }

    /**
     * Configurar novo Gateway de comunicação
     *
     * @param url
     * @param ws
     * @return
     */
    public AsyncTask<Device, Void, String> setupNewGateway(String url, String ws) {
        GatewayConnection gateway_connection = prepare(url,ws);
        this.task = this.connect(gateway_connection);
        return this.task;
    }
    public List<GatewayConnection> getGateways(){
        if(gateways == null) gateways = new ArrayList<>();
        return this.gateways;
    }
    /**
     * Inicia coneção com o socket
     * @param connection
     * @return
     */
    public AsyncTask<Device, Void, String> connect(GatewayConnection connection){
        DeviceConnect device_connection = new DeviceConnect(connection,this.getMainActivity());
        connections.add(device_connection);

        Device device = new Device();
        device.setMac(getMacAddr());
        device.setApplicationId("f20e2ed5-e318-4f38-bdfd-2fceb5d0315d");
        device.setName("MobManager-Q10-Java");
        device.setNumbers(this.getPhones());

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB){
            return device_connection.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR,device);
        }else{
            return device_connection.execute(device);
        }
    }
    /**
     * Obtem mac adress do dispositivo para verificação de assinatura
     *
     * @return
     */
    public  String getMacAddr() {
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
