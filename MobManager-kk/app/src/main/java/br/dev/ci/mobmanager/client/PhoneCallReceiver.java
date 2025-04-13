package br.dev.ci.mobmanager.client;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.telephony.TelephonyManager;

public class PhoneCallReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String state = intent.getStringExtra(TelephonyManager.EXTRA_STATE);
        if (state != null) {
            if (state.equals(TelephonyManager.EXTRA_STATE_RINGING)) {
                // O telefone está tocando (chamada recebida)
                String incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER);
                 this.seuMetodoQuandoTocando(context, incomingNumber);

            } else if (state.equals(TelephonyManager.EXTRA_STATE_OFFHOOK)) {
                // Uma chamada está ativa (discando ou atendendo)
                 this.seuMetodoQuandoChamadaAtiva(context);

            } else if (state.equals(TelephonyManager.EXTRA_STATE_IDLE)) {
                // O telefone está ocioso (nenhuma chamada ativa)
                 this.seuMetodoQuandoChamadaTerminar(context);
            }
        }
    }

    // Seus métodos para diferentes estados da chamada
    private void seuMetodoQuandoTocando(Context context, String numero) {
        //Log.i(TAG, "Executando método quando o telefone está tocando. Número: " + numero);
        // Coloque aqui a lógica que você quer executar quando o telefone tocar
    }

    private void seuMetodoQuandoChamadaAtiva(Context context) {
        //Log.i(TAG, "Executando método quando a chamada está ativa.");
        // Coloque aqui a lógica que você quer executar quando a chamada iniciar
    }

    private void seuMetodoQuandoChamadaTerminar(Context context) {
        //Log.i(TAG, "Executando método quando a chamada termina.");
        // Coloque aqui a lógica que você quer executar quando a chamada terminar
    }
}
