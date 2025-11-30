package br.dev.ci.mobilemanger;
import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.telephony.SubscriptionInfo;
import android.telephony.SubscriptionManager;
import android.telephony.TelephonyManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
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
import br.dev.ci.mobilemanger.client.WebSocketEventsService;
import br.dev.ci.mobilemanger.client.ManagerClient;
import br.dev.ci.mobilemanger.client.model.Device;
import br.dev.ci.mobilemanger.client.model.PhoneNumber;
public class MainActivity extends AppCompatActivity {
    private static final int REQUEST_READ_PHONE_STATE = 1;
    private ArrayList<PhoneNumber> phones;
    private TextView message;
    private Button appsButton;
    private WebView webView;
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
        webView = findViewById(R.id.minhaWebView);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true); // Habilita JavaScript (importante para maioria dos sites)
        webSettings.setDomStorageEnabled(true); // Habilita armazenamento local (localStorage)
        // 3. Forçar abertura de links DENTRO do app
        // Se você não adicionar isso, o link abrirá no navegador externo
        webView.setWebViewClient(new WebViewClient());
        // 4. Carregar a URL
        webView.loadUrl("https://apps.ci.dev.br/launcher");
        // webView.addJavascriptInterface(new WebAppInterface(this), "AndroidLauncher");
        this.message = findViewById(R.id.message);
        solicitarPermissoes();
        try {
            if(this.phones == null || this.phones.size() == 0){
                identificarNumerosTelefone();
            }
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
            // old: adicionarGateway("https://apps.ci.dev.br/", "wss://apps.ci.dev.br/");
            // TODO: alterar para worker events em segundo plano
            ManagerClient.getInstance().setupNewGateway("https://apps.ci.dev.br/", "wss://apps.ci.dev.br/");
            // import android.content.Intent;
            // import android.os.Build;
            // Na sua Activity (ex: no clique de um botão)
            Intent serviceIntent = new Intent(this, WebSocketEventsService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                // Para Android 8.0+, deve-se usar startForegroundService
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
            // No método onCreate() ou em um listener de clique de botão da sua Activity
            /// Intent serviceIntent = new Intent(this, WebSocketEventsService.class);
            /// ContextCompat.startForegroundService(this, serviceIntent);
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
        // if (ActivityCompat.checkSelfPermission(getApplicationContext(), android.Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_PHONE_STATE}, PackageManager.PERMISSION_GRANTED);
        // }
        // if (ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_SMS}, PackageManager.PERMISSION_GRANTED);
        // }
        // if (ActivityCompat.checkSelfPermission(getApplicationContext(), android.Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_SMS}, PackageManager.PERMISSION_GRANTED);
        // }
        // if (ActivityCompat.checkSelfPermission(getApplicationContext(), android.Manifest.permission.READ_PHONE_NUMBERS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.READ_PHONE_NUMBERS}, PackageManager.PERMISSION_GRANTED);
        // }
    }
    // @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP_MR1)
    private void identificarNumerosTelefone() {
        if (
              /* ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED &&
              ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_PHONE_NUMBERS) == PackageManager.PERMISSION_GRANTED
             && */ ActivityCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED ) {
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
                    for (SubscriptionInfo subscriptionInfo : subscriptionInfoList) {
                         TelephonyManager telephonyManager = ((TelephonyManager) getApplicationContext().getSystemService(Context.TELEPHONY_SERVICE)).createForSubscriptionId(subscriptionInfo.getSubscriptionId());
                        PhoneNumber phone_number = new PhoneNumber();
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                            phone_number.setNumber(subscriptionInfo.getNumber());
                        }
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                            phone_number.setCarrierName(subscriptionInfo.getCarrierName().toString());
                        }
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                            phone_number.setSubscriptionId(subscriptionInfo.getSubscriptionId());
                        }
                        if(phone_number.getNumber() == null){
                            phone_number.setNumber(telephonyManager.getLine1Number());
                        }
                        if(!this.phones.stream().findFirst().stream()
                                .anyMatch(f -> f.getSubscriptionId().equals(phone_number.getSubscriptionId()))
                        ){
                            this.phones.add(phone_number);
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                // throw new RuntimeException(e);
            }
        }
    }
    /**
     * Obtém a lista de todos os aplicativos instalados.
     * @param context O contexto da aplicação.
     * @return Uma lista de objetos ApplicationInfo.
     */
    public static List<ApplicationInfo> getInstalledApps(Context context) {
        final PackageManager pm = context.getPackageManager();
        List<ApplicationInfo> apps;
        // Flags para obter informações adicionais (pode ser ajustado conforme a necessidade)
        int flags = PackageManager.GET_META_DATA;
        // Adiciona a flag GET_UNINSTALLED_PACKAGES para API < 33 (Tiramisu)
        // Isso é opcional, mas garante que aplicativos desinstalados que ainda possuem
        // dados armazenados (como dados de usuário) sejam incluídos.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            // Deprecated no Tiramisu (API 33)
            // No Tiramisu e superior, 0L já é suficiente ou use ApplicationInfoFlags
            // como demonstrado abaixo (embora 0 seja o valor padrão).
            flags |= PackageManager.GET_UNINSTALLED_PACKAGES;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // API 33 (Tiramisu) e superior requer o uso de ApplicationInfoFlags
            apps = pm.getInstalledApplications(
                    PackageManager.ApplicationInfoFlags.of(flags)
            );
        } else {
            // Versões antigas (abaixo de Tiramisu)
            // O valor da flag é um int.
            apps = pm.getInstalledApplications(flags);
        }
        return apps;
    }
    /**
     * Filtra a lista para obter apenas os aplicativos instalados pelo usuário
     * (excluindo a maioria dos aplicativos do sistema).
     * @param context O contexto da aplicação.
     * @return Uma lista de objetos ApplicationInfo de aplicativos de usuário.
     */
    public static List<ApplicationInfo> getUserInstalledApps(Context context) {
        List<ApplicationInfo> installedApps = getInstalledApps(context);
        List<ApplicationInfo> userApps = new ArrayList<>();
        for (ApplicationInfo appInfo : installedApps) {
            // Filtra o próprio app e apps do sistema
            if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0) {
                userApps.add(appInfo);
            }
        }
        return userApps;
    }
}