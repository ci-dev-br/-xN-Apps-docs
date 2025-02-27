package br.dev.ci.mobmanagerjavaedition;
import android.Manifest;
import android.app.AlertDialog;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.telephony.SubscriptionInfo;
import android.telephony.SubscriptionManager;
import android.view.View;
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

import br.dev.ci.mobmanagerjavaedition.client.ManagerClient;
import br.dev.ci.mobmanagerjavaedition.client.model.GatewayConnection;
import br.dev.ci.mobmanagerjavaedition.client.model.PhoneNumber;

public class MainActivity extends AppCompatActivity {
    private static final int REQUEST_READ_PHONE_STATE = 1;

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
        this.appsButton = findViewById(R.id.apps);
        this.message = findViewById(R.id.message);
        String api = "https://apps.ci.dev.br:446/";
        String ws = "wss://apps.ci.dev.br:446/";
        if(this.message != null){
            this.message.setText("Iniciando conexção... (1)");
            permission();
            getPhoneNumber();
            this.message.setText("Identificando números disponíveis");
            adicionarItem(api, ws);
            this.message.setText("Dipositivo identificado");
        }
        if(this.appsButton != null){
            this.appsButton.setOnClickListener(v -> this.openApps());
        }
    }

    public void adicionarItem(String api, String ws) {
        ManagerClient.getInstance().addGateway(api, ws);
    }

    private void openApps(){


        AlertDialog.Builder builder = new  AlertDialog.Builder(this);
        builder
                .setTitle("Apps")
                 .setView(View.inflate(this,R.layout.list_apps_fragment_item_list,null))
        ;
        AlertDialog dialog = builder.create();

        dialog.show();
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
    private List<PhoneNumber> phones;
    private List<GatewayConnection> gateways;
    public void atualizarLista() {
        String[] gateways = new String[ManagerClient.getInstance().getGateways() != null ? ManagerClient.getInstance().getGateways().size() : 0];
        if (ManagerClient.getInstance().getGateways() != null)
            gateways = ManagerClient.getInstance().getGateways().toArray(gateways);
        this.gateways = ManagerClient.getInstance().getGateways();
        /*if (this.adapter == null) this.adapter = new ItemListAdapter(this.getActivity()/*,
                R.layout.* /, this.gateways);
        this.servidoresLista.setAdapter(this.adapter);
        */
    }

    private void getPhoneNumber() {
        if (/*ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED && */ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_PHONE_NUMBERS) == PackageManager.PERMISSION_GRANTED /*&& ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED*/ || true) {

            SubscriptionManager subscriptionManager = (SubscriptionManager) getApplicationContext().getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE);
            List<SubscriptionInfo> subscriptionInfoList = subscriptionManager.getActiveSubscriptionInfoList();
            this.phones = new ArrayList<>();
            for (SubscriptionInfo subscriptionInfo : subscriptionInfoList) {
                int subscriptionId = subscriptionInfo.getSubscriptionId();
                String carrierName = subscriptionInfo.getCarrierName().toString();
                String number = subscriptionInfo.getNumber();

                // TelephonyManager telephonyManager = ((TelephonyManager) requireContext().getSystemService(Context.TELEPHONY_SERVICE)).createForSubscriptionId(subscriptionId);
                PhoneNumber phone_number = new PhoneNumber(){{
                    setNumber(number);
                    setCarrierName(carrierName);
                    setSubscriptionId(subscriptionId);
                }}; //  telephonyManager.getLine1Number();
                this.phones.add(phone_number);
            }
            ManagerClient.getInstance().setPhones(this.phones);
        }
    }

    /*@Override
    public void (int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (requestCode == REQUEST_READ_PHONE_STATE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                getPhoneNumber();
            } else {
                Toast.makeText(getApplicationContext(), "Permissão negada. Não é possível obter os números de telefone.", Toast.LENGTH_SHORT).show();
            }
        }
    }*/
}