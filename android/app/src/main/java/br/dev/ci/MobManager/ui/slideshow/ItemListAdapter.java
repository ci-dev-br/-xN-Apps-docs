package br.dev.ci.MobManager.ui.slideshow;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import java.util.List;

import br.dev.ci.MobManager.R;
import br.dev.ci.MobManager.client.model.GatewayConnection;

public class ItemListAdapter extends BaseAdapter {

    private Context context;
    private List<GatewayConnection> listaItens;

    public ItemListAdapter(Context context, List<GatewayConnection> listaItens) {
        this.context = context;
        this.listaItens = listaItens;
    }


    @Override
    public int getCount() {
        return listaItens.size();
    }

    @Override
    public Object getItem(int position) {
        return listaItens.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        if (convertView == null) {
            convertView = LayoutInflater.from(context).inflate(R.layout.list_item, parent, false);
        }
        GatewayConnection info_connection = listaItens.get(position);

        if(!info_connection.initialized()){
            ImageView imagemImageView = convertView.findViewById(R.id.Imagem);
            TextView tituloTextView = convertView.findViewById(R.id.Titulo);
            TextView subtituloTextView = convertView.findViewById(R.id.Subtitulo);

            info_connection.setImageView(imagemImageView);
            info_connection.setTituloTextView(tituloTextView);
            info_connection.setSubtituloTextView(subtituloTextView);

        }
        info_connection.tryConnect();

        return convertView;
    }
}
