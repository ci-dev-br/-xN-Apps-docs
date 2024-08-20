package br.dev.ci.MobManager.ui.home;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.telephony.SubscriptionInfo;
import android.telephony.SubscriptionManager;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import java.util.ArrayList;
import java.util.List;

import javax.net.ssl.HostnameVerifier;

import br.dev.ci.MobManager.client.ManagerClient;
import br.dev.ci.MobManager.client.model.GatewayConnection;
import br.dev.ci.MobManager.databinding.FragmentHomeBinding;
import br.dev.ci.MobManager.ui.slideshow.ItemListAdapter;

public class HomeFragment extends Fragment {
    private static final int REQUEST_READ_PHONE_STATE = 1;
    private FragmentHomeBinding binding;
    private ListView servidoresLista;
    private List<GatewayConnection> gateways;

    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        HomeViewModel homeViewModel = new ViewModelProvider(this).get(HomeViewModel.class);
        binding = FragmentHomeBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        final EditText url_input = binding.urlInput;
        final Button addButton = binding.addButton;
        this.servidoresLista = binding.lista;
        url_input.setText("http://192.168.0.119:86/");
        addButton.setOnClickListener(v -> {
            String url = url_input.getText().toString();
            adicionarItem(url);
            url_input.setText("");
        });
        permission();
        getPhoneNumber();
        this.atualizarLista();
        return root;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private ItemListAdapter adapter;

    public void atualizarLista() {
        String[] gateways = new String[ManagerClient.getInstance().getGateways() != null ? ManagerClient.getInstance().getGateways().size() : 0];
        if (ManagerClient.getInstance().getGateways() != null)
            gateways = ManagerClient.getInstance().getGateways().toArray(gateways);
        this.gateways = ManagerClient.getInstance().getGateways();
        if (this.adapter == null) this.adapter = new ItemListAdapter(this.getActivity()/*,
                R.layout.*/, this.gateways);
        this.servidoresLista.setAdapter(this.adapter);
    }


    private void permission() {
        if (ActivityCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(requireActivity(), new String[]{Manifest.permission.READ_PHONE_STATE}, REQUEST_READ_PHONE_STATE);
        }
        if (ActivityCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(requireActivity(), new String[]{Manifest.permission.READ_SMS}, REQUEST_READ_PHONE_STATE);
        }
        if (ActivityCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_PHONE_NUMBERS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(requireActivity(), new String[]{Manifest.permission.READ_PHONE_NUMBERS}, REQUEST_READ_PHONE_STATE);
        }
    }

    private List<String> phones;

    private void getPhoneNumber() {
        if (/*ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED && */ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.READ_PHONE_NUMBERS) == PackageManager.PERMISSION_GRANTED /*&& ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED*/ || true) {

            SubscriptionManager subscriptionManager = (SubscriptionManager) requireContext().getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE);
            List<SubscriptionInfo> subscriptionInfoList = subscriptionManager.getActiveSubscriptionInfoList();
            this.phones = new ArrayList<>();
            for (SubscriptionInfo subscriptionInfo : subscriptionInfoList) {
                int subscriptionId = subscriptionInfo.getSubscriptionId();
                TelephonyManager telephonyManager = ((TelephonyManager) requireContext().getSystemService(Context.TELEPHONY_SERVICE)).createForSubscriptionId(subscriptionId);
                String phoneNumber = telephonyManager.getLine1Number();
                if(phoneNumber != null && !phoneNumber.isBlank())
                    this.phones.add(phoneNumber);
            }
            ManagerClient.getInstance().setPhones(this.phones);
        }
    }

    public void adicionarItem(String endpoint) {
        ManagerClient.getInstance().addGateway(endpoint);
        this.adapter.notifyDataSetChanged();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (requestCode == REQUEST_READ_PHONE_STATE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                getPhoneNumber();
            } else {
                Toast.makeText(requireContext(), "Permissão negada. Não é possível obter os números de telefone.", Toast.LENGTH_SHORT).show();
            }
        }
    }
}