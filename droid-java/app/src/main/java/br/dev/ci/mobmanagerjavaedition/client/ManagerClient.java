package br.dev.ci.mobmanagerjavaedition.client;

import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
// import br.dev.ci.mobmanagerjavaedition.InicioActivity;
import br.dev.ci.mobmanagerjavaedition.MainActivity;
import br.dev.ci.mobmanagerjavaedition.client.model.Device;
import br.dev.ci.mobmanagerjavaedition.client.model.GatewayConnection;
import br.dev.ci.mobmanagerjavaedition.client.model.PhoneNumber;

public class ManagerClient {
    private MainActivity activity;
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
    public MainActivity getActivity() {
        return activity;
    }
    public void setActivity(MainActivity activity) {
        this.activity = activity;
    }
    List<GatewayConnection> gateways;
    public void addGateway(String url, String ws) {
        GatewayConnection gateway = new GatewayConnection(activity){{
            if(url != null)setUrl(url);
            if(ws != null)setWs(ws);
        }};
        this.getGateways().add(gateway);
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
            setName("MobManager-JavaEdition");
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
        }
        return "";
    }


}

