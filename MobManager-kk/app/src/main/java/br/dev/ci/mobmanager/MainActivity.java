package br.dev.ci.mobmanager;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.telephony.SubscriptionInfo;
import android.telephony.SubscriptionManager;
import android.widget.Button;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.util.ArrayList;
import java.util.List;

import br.dev.ci.mobmanager.client.DeviceConnect;
import br.dev.ci.mobmanager.client.ManagerClient;
import br.dev.ci.mobmanager.client.model.Device;
import br.dev.ci.mobmanager.client.model.PhoneNumber;

public class MainActivity extends AppCompatActivity {
    private static final int REQUEST_READ_PHONE_STATE = 1;
    private List<PhoneNumber> phones;
    private TextView message;
    private Button appsButton;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
        String api = "https://srv33.internals.ci.dev.br:664/";
        String ws = "wss://srv33.internals.ci.dev.br:664/";
        this.message = findViewById(R.id.message);
        permission();
        try {
            getPhoneNumber();
        } catch( Exception ex){
            if(this.message != null) {
                this.message.setText("Falha ao identificar números do dispositivo.");
            }
        }
        if(this.message != null){
            this.message.setText("Iniciando conexção... (1)");
        }

        if(this.message != null){
            this.message.setText("Identificando números disponíveis");
        }
        try {
            adicionarItem(api, ws);
            Boolean ffail = false;
            for (DeviceConnect dc : ManagerClient.getInstance().getConnections()){
                    if( dc.status == null ){
                        ffail = true;
                    }
            }
            if(ffail == Boolean.TRUE){
                throw new Exception("Falha ao conectar");
            }
            if(this.message != null){
                this.message.setText("Dipositivo identificado");
            }
        }catch(Exception ex){
            this.message.setText("Falha ao conectar");
        }

        if(this.appsButton != null){
            this.appsButton.setOnClickListener(v -> this.openApps());
        }
    }
    private void openApps(){


        /*AlertDialog.Builder builder = new  AlertDialog.Builder(this);
        builder
                .setTitle("Apps")
                .setView(View.inflate(this,R.layout.list_apps_fragment_item_list,null))
        ;
        AlertDialog dialog = builder.create();

        dialog.show();*/
    }
    public AsyncTask<Device, Void, String> adicionarItem(String api, String ws) {
        return ManagerClient.getInstance().addGateway( api, ws);
    }
    private void permission() {
        if (ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_PHONE_STATE}, REQUEST_READ_PHONE_STATE);
        }
        if (ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_SMS}, REQUEST_READ_PHONE_STATE);
        }
        if (ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_PHONE_NUMBERS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_PHONE_NUMBERS}, REQUEST_READ_PHONE_STATE);
        }
    }
    // @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP_MR1)
    private void getPhoneNumber() {
        if (
                /*ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED && */
                ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_PHONE_NUMBERS) == PackageManager.PERMISSION_GRANTED
                /* && ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED*/ ) {
            try {
                SubscriptionManager subscriptionManager = null;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                    subscriptionManager = (SubscriptionManager) getApplicationContext().getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE);
                }
                if(subscriptionManager != null) {
                    List<SubscriptionInfo> subscriptionInfoList = null;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                        subscriptionInfoList = subscriptionManager.getActiveSubscriptionInfoList();
                    }
                    this.phones = ManagerClient.getInstance().getPhones();
                    if (phones == null) {
                        phones = new ArrayList<>();
                    }
                    for (SubscriptionInfo subscriptionInfo : subscriptionInfoList) {
                        // TelephonyManager telephonyManager = ((TelephonyManager) requireContext().getSystemService(Context.TELEPHONY_SERVICE)).createForSubscriptionId(subscriptionId);
                        PhoneNumber phone_number = new PhoneNumber() {{
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                                setNumber(subscriptionInfo.getNumber());
                            }
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                                setCarrierName(subscriptionInfo.getCarrierName().toString());
                            }
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                                setSubscriptionId(subscriptionInfo.getSubscriptionId());
                            }
                        }}; //  telephonyManager.getLine1Number();
                        this.phones.add(phone_number);
                    }
                    ManagerClient.getInstance().setPhones(this.phones);
                }
            } catch (Exception e) {
                // throw new RuntimeException(e);
            }
        }
    }
}