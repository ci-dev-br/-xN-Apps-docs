package br.dev.ci.MobManager.ui.home;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import java.util.List;

import br.dev.ci.MobManager.client.ManagerClient;
import br.dev.ci.MobManager.client.model.GatewayConnection;
import br.dev.ci.MobManager.databinding.FragmentHomeBinding;
import br.dev.ci.MobManager.ui.slideshow.ItemListAdapter;

public class HomeFragment extends Fragment {

    private FragmentHomeBinding binding;
    private ListView servidoresLista;
    private List<GatewayConnection> gateways;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        HomeViewModel homeViewModel =
                new ViewModelProvider(this).get(HomeViewModel.class);

        binding = FragmentHomeBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        final EditText url_input = binding.urlInput;
        final Button addButton = binding.addButton;
        this.servidoresLista = binding.lista;

        url_input.setText("https://apps.ci.dev.br:446/");
        addButton.setOnClickListener(v -> {
            String url = url_input.getText().toString();
            adicionarItem(url);
            url_input.setText("");
        });
        this.atualizarLista();
        return root;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private ItemListAdapter adapter;
    public void atualizarLista(){
        String[] gateways = new String[ManagerClient.getInstance().getGateways() != null ?
                ManagerClient.getInstance().getGateways().size() : 0];

        if(ManagerClient.getInstance().getGateways() != null)
            gateways = ManagerClient.getInstance().getGateways().toArray(gateways);

        // this.gateways = new ArrayList<>();
        this.gateways = ManagerClient.getInstance().getGateways();

        if(this.adapter == null)
         this.adapter = new ItemListAdapter(this.getActivity()/*,
                R.layout.*/, this.gateways);

        this.servidoresLista.setAdapter(this.adapter);
    }

    public void adicionarItem(String endpoint){
        ManagerClient.getInstance().addGateway(endpoint);
        this.adapter.notifyDataSetChanged();
    }
}