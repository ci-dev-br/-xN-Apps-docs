package br.dev.ci.mobilemanger;

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

import br.dev.ci.mobilemanger.client.ManagerClient;
import br.dev.ci.mobilemanger.client.model.Device;
import br.dev.ci.mobilemanger.client.model.PhoneNumber;

public class MainActivity extends AppCompatActivity {
    private static final int REQUEST_READ_PHONE_STATE = 1;
    private List<PhoneNumber> phones;
    private TextView message;
    private Button appsButton;
    public TextView getMessage(){
        return this.message;
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ManagerClient.getInstance().setMainActivity(this);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
        this.message = findViewById(R.id.message);
        solicitarPermissoes();
        try {
            identificarNumerosTelefone();
        } catch( Exception ex){
            if(this.message != null) {
                this.message.setText("Falha ao identificar números do dispositivo.");
            }
        }
        /* if(this.message != null){
            this.message.setText("Iniciando conexção... (1)");
        }*/

        /* if(this.message != null){
            this.message.setText("Identificando números disponíveis");
        }*/
        try {
            adicionarGateway("https://srv33.internals.ci.dev.br:664/", "wss://srv33.internals.ci.dev.br:664/");
        }catch(Exception ex){
            this.message.setText("Falha ao conectar");
        }

        if(this.appsButton != null){
            this.appsButton.setOnClickListener(v -> this.openApps());
        }
    }
    private void openApps(){
        // TODO: abrir menu de aplicativos do dispositivo
    }
    public AsyncTask<Device, Void, String> adicionarGateway(String api, String ws) {
        return ManagerClient.getInstance().setupNewGateway( api, ws);
    }
    private void solicitarPermissoes() {
        if (ActivityCompat.checkSelfPermission(getApplicationContext(), android.Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_PHONE_STATE}, REQUEST_READ_PHONE_STATE);
        }
        if (ActivityCompat.checkSelfPermission(getApplicationContext(), android.Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_SMS}, REQUEST_READ_PHONE_STATE);
        }
        if (ActivityCompat.checkSelfPermission(getApplicationContext(), android.Manifest.permission.READ_PHONE_NUMBERS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_PHONE_NUMBERS}, REQUEST_READ_PHONE_STATE);
        }
    }
    // @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP_MR1)
    private void identificarNumerosTelefone() {
        if (
                true
            /*ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED && */
            //  ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_PHONE_NUMBERS) == PackageManager.PERMISSION_GRANTED
            /* && ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED*/ ) {
            try {
                SubscriptionManager subscriptionManager = null;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                    subscriptionManager = (SubscriptionManager) getApplicationContext().getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE);
                }
                if(subscriptionManager != null) {
                    List<SubscriptionInfo> subscriptionInfoList = null;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
                            // TODO: Consider calling
                            //    ActivityCompat#requestPermissions
                            // here to request the missing permissions, and then overriding
                            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                            //                                          int[] grantResults)
                            // to handle the case where the user grants the permission. See the documentation
                            // for ActivityCompat#requestPermissions for more details.
                            return;
                        }
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
                        }};
                        // telephonyManager.getLine1Number();
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