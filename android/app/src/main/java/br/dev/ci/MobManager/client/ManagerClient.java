package br.dev.ci.MobManager.client;

import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import br.dev.ci.MobManager.MainActivity;
import br.dev.ci.MobManager.client.model.Device;
import br.dev.ci.MobManager.client.model.GatewayConnection;
import br.dev.ci.MobManager.client.model.PhoneNumber;

public class ManagerClient {
    private MainActivity mainActivity;
    private static ManagerClient _instance = new ManagerClient();
    private List<PhoneNumber> phones;

    public List<PhoneNumber> getPhones() {
        return phones;
    }

    public void setPhones(List<PhoneNumber> phones) {
        this.phones = phones;
    }

    public static ManagerClient getInstance(){
        return ManagerClient._instance;
    }


    public void setMainActivity(MainActivity mainActivity) {this.mainActivity = mainActivity;}
    List<GatewayConnection> gateways;

    public void addGateway(String url) {
        GatewayConnection gateway  =new GatewayConnection(){{
            setUrl(url);
        }};
        this.gateways.add(gateway);
        this.connect(gateway);
    }

    public List<GatewayConnection> getGateways(){
        if(gateways == null) gateways = new ArrayList<>();
        return this.gateways;
    }

    private void connect(GatewayConnection connection){
        DeviceConnect dc = new DeviceConnect(connection);
        Device device = new Device(){{
            setId(getMacAddr());
            setApplicationId("e60e2ed1-e318-4f38-bdcd-2fceb3d0315d");
            setName("MobManager");
            setNumbers(getPhones());
        }};
        dc.execute(device);
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

