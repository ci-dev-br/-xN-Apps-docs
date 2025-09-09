package br.dev.ci.mobilemanger.client;
import android.content.Context;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import br.dev.ci.mobilemanger.client.model.GatewayConnection;

public class Events  extends Worker{
    private GatewayConnection gateway;
    public Events(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
        try {
            this.gateway=ManagerClient.getInstance().getGateways().get(0);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @NonNull
    @Override
    public Result doWork() {
        // Seu código para a tarefa em segundo plano.
        // Por exemplo, fazer upload de dados para um servidor.
        try {
            if(this.gateway != null && this.gateway.initialized()){
            }else{
                this.gateway.tryConnect();
            }
            return Result.success();
        } catch (Exception e) {
            e.printStackTrace();
            return Result.failure();
        }
    }
}
