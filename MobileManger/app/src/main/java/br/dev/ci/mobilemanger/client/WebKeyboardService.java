package br.dev.ci.mobilemanger.client;
import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.annotation.SuppressLint;
import android.graphics.Path;
import android.inputmethodservice.InputMethodService;
import android.os.SystemClock;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.inputmethod.InputConnection;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import br.dev.ci.mobilemanger.R;
public class WebKeyboardService extends InputMethodService {
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    public View onCreateInputView() {
        View layout = getLayoutInflater().inflate(R.layout.keyboard_view, null);
        WebView webView = layout.findViewById(R.id.webview_keyboard);

        webView.setWebViewClient(new android.webkit.WebViewClient());
        android.webkit.WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);

        webView.addJavascriptInterface(new WebAppInterface(), "AndroidKeyboard");
        webView.loadUrl("https://development.ci.dev.br/keyboard");

        return layout;
    }

    // Classe que fará a ponte entre o JavaScript e o Java
    private class WebAppInterface {

        @JavascriptInterface
        public void onKey(String text) {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) {
                // Insere o texto no campo focado pelo usuário
                ic.commitText(text, 1);
            }
        }

        @JavascriptInterface
        public void onAction(String action) {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) {
                switch (action) {
                    case "BACKSPACE":
                        // Simula o pressionamento e soltura da tecla de apagar
                        ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_DEL));
                        ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_DEL));
                        break;
                    case "ENTER":
                        ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER));
                        ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_ENTER));
                        break;
                    case "TAB":
                        ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_TAB));
                        ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_TAB));
                        break;
                    default:
                        if(action.indexOf("X") > -1){
                            long downTime = SystemClock.uptimeMillis();
                            long eventTime = SystemClock.uptimeMillis() + 100;

                            float x = 500f;
                            float y = 1000f;

                            MotionEvent downEvent = MotionEvent.obtain(
                                    downTime, eventTime, MotionEvent.ACTION_DOWN, x, y, 0
                            );

                            MotionEvent upEvent = MotionEvent.obtain(
                                    downTime, eventTime + 50, MotionEvent.ACTION_UP, x, y, 0
                            );

                            downEvent.recycle();
                            upEvent.recycle();

                        }
                }
            }
        }
    }

    @Override
    public void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }

    // Impede que o Android tente colocar o teclado em tela cheia (Extract Mode)
    @Override
    public boolean onEvaluateFullscreenMode() {
        return false;
    }

    @Override
    public void onComputeInsets(Insets outInsets) {
        super.onComputeInsets(outInsets);
        if (!isFullscreenMode()) {
            outInsets.contentTopInsets = outInsets.visibleTopInsets;
        }
    }


}