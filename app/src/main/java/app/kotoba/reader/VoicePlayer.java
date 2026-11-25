package app.kotoba.reader;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.widget.Toast;
import java.io.IOException;

final class VoicePlayer {
    private final Context context;
    private MediaPlayer player;

    VoicePlayer(Context context) { this.context = context; }

    void play(String name) {
        stop();
        String extension = name.equals("coffee-order") ? ".mp3" : ".wav";
        try (AssetFileDescriptor file = context.getAssets().openFd("japanese/" + name + extension)) {
            MediaPlayer clip = new MediaPlayer();
            player = clip;
            clip.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
            clip.setDataSource(file.getFileDescriptor(), file.getStartOffset(), file.getLength());
            clip.setOnPreparedListener(ready -> { if (player == ready) ready.start(); });
            clip.setOnCompletionListener(ended -> { if (player == ended) stop(); });
            clip.setOnErrorListener((failed, what, extra) -> {
                if (player == failed) playbackError();
                return true;
            });
            clip.prepareAsync();
        } catch (IOException | IllegalStateException error) {
            playbackError();
        }
    }

    void stop() {
        if (player == null) return;
        MediaPlayer old = player;
        player = null;
        old.setOnPreparedListener(null);
        old.setOnCompletionListener(null);
        old.setOnErrorListener(null);
        old.release();
    }

    private void playbackError() {
        stop();
        Toast.makeText(context, "Couldn’t play this recording. Tap to try again.", Toast.LENGTH_SHORT).show();
    }
}
