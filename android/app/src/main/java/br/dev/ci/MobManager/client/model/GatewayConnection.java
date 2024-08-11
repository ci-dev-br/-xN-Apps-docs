package br.dev.ci.MobManager.client.model;

import android.os.Handler;
import android.widget.ImageView;
import android.widget.TextView;

import br.dev.ci.MobManager.R;

public class GatewayConnection {
    private String url;
    private String status;
    public String getUrl() {
        return url;
    }

    public Boolean initialized(){
        return titulo != null;
    }
    public void setUrl(String url) {
        this.url = url;

        if(this.subtitulo != null)
        this.subtitulo.setText(this.url);
    }
    public void tryConnect(){
        if(this.titulo != null){
                this.titulo.setText("Iniciando conexão");
                this.imagem.setImageResource(br.dev.ci.MobManager.R.mipmap.connecting);



        }

        Handler handler = new Handler();
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                // Código que você deseja executar após o atraso
                if(titulo != null){
                    titulo.setText("Offline");
                    imagem.setImageResource(R.mipmap.offline);

                }
            }
        };

        handler.postDelayed(runnable, 5000);
    }
    private ImageView imagem;
    public void setImageView(ImageView imagem){
            this.imagem = imagem;
    }
    private TextView titulo;
    public void setTituloTextView(TextView titulo){
        this.titulo = titulo;
    }
    private TextView subtitulo;
    public void setSubtituloTextView(TextView subtitulo){
        this.subtitulo = subtitulo;

        if(this.url != null)
            this.subtitulo.setText(this.url);
    }

}
