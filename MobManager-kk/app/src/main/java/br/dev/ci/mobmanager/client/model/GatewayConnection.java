package br.dev.ci.mobmanager.client.model;

import android.os.Handler;
import android.widget.ImageView;
import android.widget.TextView;

public class GatewayConnection {
    private String url;
    private String status;
    private ImageView imagem;
    private TextView subtitulo;
    private TextView titulo;
    // private DeviceConnect connect;
    private String ws;
    public String getUrl() {
        return url;
    }
    public Boolean initialized(){
        return titulo != null;
    }
    public void setUrl(String url) {
        this.url = url;

        if (this.subtitulo != null)
            this.subtitulo.setText(this.url);
    }
    /*public DeviceConnect getConnect() {
        return connect;
    }
    public void setConnect(DeviceConnect connect) {
        this.connect = connect;
    }*/
    public void setImageView(ImageView imagem){
        this.imagem = imagem;
    }
    public void setTituloTextView(TextView titulo){
        this.titulo = titulo;
    }
    public void setSubtituloTextView(TextView subtitulo){
        this.subtitulo = subtitulo;

        if(this.url != null)
            this.subtitulo.setText(this.url);
    }
    public void tryConnect(){
        if(this.titulo != null){
            this.titulo.setText("Iniciando conexão");
            // this.imagem.setImageResource(br.dev.ci.mobmanagerjavaedition.R.mipmap.connecting);
        }
        Handler handler = new Handler();
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                // Código que você deseja executar após o atraso
                if(titulo != null){
                    titulo.setText("Offline");
                   //  imagem.setImageResource(R.mipmap.offline);

                }
            }
        };
        handler.postDelayed(runnable, 0);
    }
    public String getWs() {
        return ws;
    }
    public void setWs(String ws) {
        this.ws = ws;
    }
}
