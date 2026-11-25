package app.kotoba.reader;

import android.animation.ValueAnimator;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.RippleDrawable;
import android.media.AudioManager;
import android.os.Bundle;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.method.LinkMovementMethod;
import android.text.style.ClickableSpan;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.*;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

public final class LessonActivity extends Activity {
    private static final int STORY = 0, QUIZ = 1, RESULT = 2;
    private static final int PAPER = 0xfffaf8f4, INK = 0xff292531, MUTED = 0xff625e67,
            PURPLE = 0xff694d9b, TINT = 0xfff0ebf7, LINE = 0xffe4dfe6, WHITE = Color.WHITE;
    private static final int MATCH = ViewGroup.LayoutParams.MATCH_PARENT, WRAP = ViewGroup.LayoutParams.WRAP_CONTENT;
    private Lesson lesson;
    private VoicePlayer voice;
    private SharedPreferences prefs;
    private LinearLayout body, shell;
    private ScrollView scroll;
    private int level, phase, sceneIndex, questionIndex, selected, score;
    private boolean checked;
    private AlertDialog overlay;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);
        lesson = new Lesson(getAssets());
        voice = new VoicePlayer(this);
        prefs = getSharedPreferences("practice", MODE_PRIVATE);
        level = prefs.getInt("level", 0);
        phase = prefs.getInt("phase", STORY);
        sceneIndex = prefs.getInt("scene", 0);
        questionIndex = prefs.getInt("question", 0);
        selected = prefs.getInt("selected", -1);
        score = prefs.getInt("score", 0);
        checked = prefs.getBoolean("checked", false);
        render();
        if (state != null) {
            int position = state.getInt("scroll", 0);
            scroll.post(() -> scroll.scrollTo(0, position));
        } else if (phase == STORY) {
            playBarista();
        }
    }

    @Override protected void onSaveInstanceState(Bundle state) {
        super.onSaveInstanceState(state);
        state.putInt("scroll", scroll.getScrollY());
    }

    @Override protected void onPause() {
        voice.stop();
        super.onPause();
    }

    private void save() {
        prefs.edit().putInt("level", level).putInt("phase", phase)
                .putInt("scene", sceneIndex).putInt("question", questionIndex)
                .putInt("selected", selected).putInt("score", score)
                .putBoolean("checked", checked).apply();
    }

    private JSONObject scene() { return lesson.scenes.optJSONObject(sceneIndex); }
    private JSONArray questions() { return lesson.quizzes.optJSONArray(level); }
    private JSONObject question() { return questions().optJSONObject(questionIndex); }
    private boolean advanced() { return level == 2; }
    private int dp(float n) { return Math.round(n * getResources().getDisplayMetrics().density); }

    private GradientDrawable shape(int color, int radius, boolean border) {
        GradientDrawable background = new GradientDrawable();
        background.setColor(color);
        background.setCornerRadius(dp(radius));
        if (border) background.setStroke(dp(1), LINE);
        return background;
    }

    private LinearLayout column() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        return layout;
    }

    private LinearLayout row() {
        LinearLayout layout = new LinearLayout(this);
        layout.setGravity(Gravity.CENTER_VERTICAL);
        return layout;
    }

    private void pad(View v, int x, int y) { v.setPadding(dp(x), dp(y), dp(x), dp(y)); }

    private TextView text(String value, int size, int color) {
        TextView label = new TextView(this);
        label.setText(value);
        label.setTextSize(size);
        label.setTextColor(color);
        label.setIncludeFontPadding(false);
        return label;
    }

    private TextView title(String value, int size) {
        TextView label = text(value, size, INK);
        label.setTypeface(Typeface.SERIF);
        if (android.os.Build.VERSION.SDK_INT >= 28) label.setAccessibilityHeading(true);
        return label;
    }

    private TextView eyebrow(String value) {
        TextView label = text(value, 12, PURPLE);
        label.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        label.setLetterSpacing(.1f);
        return label;
    }

    private void add(LinearLayout parent, View child, int top) {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(MATCH, WRAP);
        params.topMargin = dp(top);
        parent.addView(child, params);
    }

    private void flexible(LinearLayout row, View child) {
        row.addView(child, new LinearLayout.LayoutParams(0, WRAP, 1));
    }

    private Button button(String caption, boolean primary, Runnable action) {
        Button b = new Button(this);
        b.setAllCaps(false);
        b.setText(caption);
        b.setTextSize(primary ? 17 : 14);
        b.setTypeface(Typeface.create("sans-serif-medium", Typeface.NORMAL));
        b.setTextColor(primary ? WHITE : PURPLE);
        b.setMinWidth(0);
        b.setMinimumWidth(0);
        b.setMinHeight(dp(48));
        b.setMinimumHeight(dp(48));
        pad(b, 14, 8);
        b.setStateListAnimator(null);
        b.setBackground(new RippleDrawable(ColorStateList.valueOf(0x227b61ab),
                shape(primary ? PURPLE : TINT, 12, false), null));
        b.setOnClickListener(v -> action.run());
        return b;
    }

    private void render() {
        shell = column();
        shell.setBackgroundColor(PAPER);
        shell.setGravity(Gravity.CENTER_HORIZONTAL);
        setContentView(shell);
        // Limit line length on tablets and unfolded displays.
        int width = Math.min(getResources().getDisplayMetrics().widthPixels, dp(640));
        LinearLayout header = row();
        pad(header, 16, 6);
        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.kotoba);
        header.addView(logo, dp(32), dp(32));
        TextView brand = text("Kotoba", 24, INK);
        brand.setTypeface(Typeface.SERIF, Typeface.BOLD);
        brand.setPadding(dp(8), 0, 0, 0);
        flexible(header, brand);
        header.addView(button("Wordbook", false, this::wordbook));
        Button more = button("⋮", false, () -> new AlertDialog.Builder(this)
                .setItems(new String[]{"Audio credits"}, (dialog, item) -> credits()).show());
        more.setTextSize(22);
        more.setContentDescription("More options");
        more.setBackgroundColor(Color.TRANSPARENT);
        header.addView(more);
        shell.addView(header, width, WRAP);
        scroll = new ScrollView(this);
        scroll.setFillViewport(false);
        body = column();
        pad(body, 16, 8);
        scroll.addView(body);
        shell.addView(scroll, new LinearLayout.LayoutParams(width, 0, 1));

        LinearLayout context = row();
        flexible(context, eyebrow("EVERYDAY JAPANESE"));
        context.addView(button(lesson.levels.optString(level) + " ▾", false, this::pickLevel));
        add(body, context, 0);
        add(body, title(phase == STORY ? "At the café" : phase == QUIZ ?
                (advanced() ? "ストーリークイズ" : "Story quiz") :
                (advanced() ? "お疲れさまでした！" : "Story complete"), 35), 4);
        if (phase == STORY) story();
        else if (phase == QUIZ) quiz();
        else result();
    }

    private void footer(String caption, boolean enabled, Runnable action) {
        LinearLayout dock = column();
        pad(dock, 16, 10);
        Button b = button(caption, true, action);
        b.setEnabled(enabled);
        b.setAlpha(enabled ? 1 : .5f);
        add(dock, b, 0);
        shell.addView(dock, Math.min(getResources().getDisplayMetrics().widthPixels, dp(640)), WRAP);
    }

    private void sceneImage(LinearLayout card, String imageName, String description, int height) {
        ImageView art = new ImageView(this);
        try (InputStream file = getAssets().open(imageName + ".webp")) {
            art.setImageBitmap(BitmapFactory.decodeStream(file));
        } catch (IOException e) { throw new IllegalStateException("Missing scene art", e); }
        art.setScaleType(ImageView.ScaleType.MATRIX);
        art.addOnLayoutChangeListener((view, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) -> {
            int width = right - left, frameHeight = bottom - top;
            int imageWidth = art.getDrawable().getIntrinsicWidth();
            int imageHeight = art.getDrawable().getIntrinsicHeight();
            float scale = Math.max((float) width / imageWidth, (float) frameHeight / imageHeight);
            Matrix crop = new Matrix();
            crop.setScale(scale, scale);
            // Keep the barista’s face in frame on wide phone and tablet layouts.
            crop.postTranslate((width - imageWidth * scale) * .5f, (frameHeight - imageHeight * scale) * .16f);
            art.setImageMatrix(crop);
        });
        art.setContentDescription(description);
        FrameLayout frame = new FrameLayout(this);
        frame.addView(art, MATCH, MATCH);
        card.addView(frame, MATCH, dp(height));
        if (ValueAnimator.areAnimatorsEnabled()) {
            art.setScaleX(1.025f);
            art.setScaleY(1.025f);
            art.animate().scaleX(1f).scaleY(1f).setDuration(3500).start();
        }
    }

    private LinearLayout card(int color) {
        LinearLayout panel = column();
        panel.setBackground(shape(color, 16, true));
        panel.setClipToOutline(true);
        add(body, panel, 12);
        return panel;
    }

    private void story() {
        JSONObject s = scene();
        add(body, text("Scene " + (sceneIndex + 1) + " of " + lesson.scenes.length()
                + "  ·  " + s.optString("title"), 15, MUTED), 5);
        LinearLayout sceneCard = card(WHITE);
        sceneImage(sceneCard, s.optString("image"), "The barista at the café counter", 170);
        LinearLayout bar = column();
        pad(bar, 14, 10);
        sceneCard.addView(bar);
        LinearLayout speaker = row();
        flexible(speaker, eyebrow("YUI  ·  BARISTA"));
        Button replay = button("Listen", false, this::playBarista);
        replay.setContentDescription("Listen to the barista");
        speaker.addView(replay);
        add(bar, speaker, 0);
        dialogue(bar, s.optJSONArray("bar"), s.optString("bRom"), s.optString("bEn"), false);

        LinearLayout turn = card(TINT);
        pad(turn, 14, 12);
        LinearLayout turnHeader = row();
        flexible(turnHeader, eyebrow("YOUR TURN  ·  CUSTOMER"));
        if (level == 0) turnHeader.addView(button("Listen to line", false,
                () -> voice.play(s.optString("youSound"))));
        add(turn, turnHeader, 0);
        dialogue(turn, s.optJSONArray("you"), s.optString("rom"), s.optString("en"), true);
        add(body, text("Tap a Japanese word for its meaning and pronunciation.", 14, MUTED), 10);
        footer(sceneIndex + 1 == lesson.scenes.length() ? "Start quiz" : "Next line", true, this::nextLine);
    }

    private void dialogue(LinearLayout panel, JSONArray parts, String roman, String translation, boolean period) {
        SpannableStringBuilder line = new SpannableStringBuilder();
        for (int i = 0; i < parts.length(); i++) {
            String key = parts.optString(i);
            JSONArray entry = lesson.words.optJSONArray(key);
            if (entry == null) { line.append(key); continue; }
            int start = line.length();
            line.append(entry.optString(0));
            line.setSpan(new ClickableSpan() {
                @Override public void onClick(View widget) { definition(key); }
            }, start, line.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
        if (period) line.append("。");
        TextView japanese = text("", 23, INK);
        japanese.setTextLocale(Locale.JAPANESE);
        japanese.setText(line);
        japanese.setLinkTextColor(INK);
        japanese.setMovementMethod(LinkMovementMethod.getInstance());
        japanese.setPadding(0, dp(4), 0, dp(3));
        add(panel, japanese, 2);
        if (level == 0) add(panel, text(roman, 15, PURPLE), 3);
        if (!advanced()) add(panel, text(translation, 15, MUTED), 4);
    }

    private void playBarista() { voice.play(scene().optString("barSound")); }

    private void nextLine() {
        voice.stop();
        if (sceneIndex + 1 < lesson.scenes.length()) sceneIndex++;
        else { phase = QUIZ; resetQuiz(); }
        save(); render();
        if (phase == STORY) playBarista();
    }

    private void resetQuiz() { questionIndex = 0; score = 0; selected = -1; checked = false; }

    private void pickLevel() {
        voice.stop();
        String[] names = new String[lesson.levels.length()];
        for (int i = 0; i < names.length; i++) names[i] = lesson.levels.optString(i);
        new AlertDialog.Builder(this).setTitle("Practice level")
                .setSingleChoiceItems(names, level, (dialog, which) -> {
                    dialog.dismiss();
                    if (which == level) return;
                    level = which;
                    if (phase != STORY) { phase = QUIZ; resetQuiz(); }
                    save(); render();
                }).setNegativeButton("Cancel", null).show();
    }

    private Set<String> savedWords() {
        return new HashSet<>(prefs.getStringSet("words", Collections.emptySet()));
    }

    private void definition(String key) {
        voice.stop();
        Set<String> saved = savedWords();
        saved.add(key);
        prefs.edit().putStringSet("words", saved).apply();
        JSONArray w = lesson.words.optJSONArray(key);
        LinearLayout content = column();
        pad(content, 24, 12);
        add(content, text(w.optString(3) + "  ·  " + w.optString(1), 18, PURPLE), 4);
        add(content, text(w.optString(2), 17, INK), 12);
        add(content, button("Hear pronunciation", false, () -> voice.play(key)), 16);
        show(new AlertDialog.Builder(this).setTitle(w.optString(0)).setView(content)
                .setPositiveButton("Done", null));
    }

    private void wordbook() {
        voice.stop();
        ArrayList<String> keys = new ArrayList<>(savedWords());
        keys.removeIf(key -> !lesson.words.has(key));
        Collections.sort(keys, (a, b) -> lesson.words.optJSONArray(a).optString(1)
                .compareTo(lesson.words.optJSONArray(b).optString(1)));
        AlertDialog.Builder builder = new AlertDialog.Builder(this).setTitle("Wordbook");
        if (keys.isEmpty()) builder.setMessage("Tap a word in the story to save it here.");
        else {
            String[] names = new String[keys.size()];
            for (int i = 0; i < names.length; i++) {
                JSONArray w = lesson.words.optJSONArray(keys.get(i));
                names[i] = w.optString(0) + "   " + w.optString(1);
            }
            builder.setItems(names, (dialog, index) -> definition(keys.get(index)));
        }
        show(builder.setNegativeButton("Close", null));
    }

    private void show(AlertDialog.Builder builder) {
        overlay = builder.create();
        overlay.setOnDismissListener(dialog -> {
            if (overlay == dialog) { overlay = null; voice.stop(); }
        });
        overlay.show();
    }

    private void credits() {
        voice.stop();
        TextView links = text("", 16, INK);
        pad(links, 24, 8);
        links.setText(android.text.Html.fromHtml(getString(R.string.audio_credits),
                android.text.Html.FROM_HTML_MODE_COMPACT));
        links.setMovementMethod(LinkMovementMethod.getInstance());
        ScrollView view = new ScrollView(this);
        view.addView(links);
        show(new AlertDialog.Builder(this).setTitle("Audio credits").setView(view).setPositiveButton("Close", null));
    }

    private void quiz() {
        JSONObject q = question();
        add(body, text((advanced() ? "問題 " : "Question ") + (questionIndex + 1) + " / " + questions().length(), 15, MUTED), 5);
        LinearLayout panel = card(WHITE);
        pad(panel, 16, 16);
        TextView prompt = text(q.optString("q"), 22, INK);
        prompt.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        add(panel, prompt, 0);
        JSONArray recordings = q.optJSONArray("audio");
        JSONArray choices = recordings == null ? q.optJSONArray("choices") : recordings;
        for (int i = 0; i < choices.length(); i++) {
            final int n = i;
            String label = recordings == null ? choices.optString(i) :
                    (advanced() ? "音声 " : "Recording ") + (i + 1);
            Button option = button((char)('A' + i) + "    " + label, false, () -> {
                if (!checked) { selected = n; save(); render(); }
                if (recordings != null) voice.play(recordings.optString(n));
            });
            option.setGravity(Gravity.START | Gravity.CENTER_VERTICAL);
            int color = selected == i ? 0xffe3d5f5 : PAPER;
            if (checked && i == q.optInt("a")) color = 0xffd9efdf;
            else if (checked && i == selected) color = 0xffffdce0;
            option.setBackgroundTintList(ColorStateList.valueOf(color));
            option.setSelected(selected == i);
            option.setEnabled(!checked || recordings != null);
            add(panel, option, 10);
        }
        if (checked) {
            boolean correct = selected == q.optInt("a");
            String feedback = correct ? (advanced() ? "正解です！" : "Correct!") :
                    (advanced() ? "正解は " : "Correct answer: ") + (char)('A' + q.optInt("a"));
            TextView result = text(feedback, 17, INK);
            result.setAccessibilityLiveRegion(View.ACCESSIBILITY_LIVE_REGION_POLITE);
            add(panel, result, 14);
        }
        boolean last = questionIndex + 1 == questions().length();
        String caption = !checked ? (advanced() ? "答えを確認" : "Check answer") :
                last ? (advanced() ? "結果を見る" : "See results") : (advanced() ? "次の問題" : "Next question");
        footer(caption, selected >= 0, this::submit);
    }

    private void submit() {
        voice.stop();
        if (!checked) {
            checked = true;
            if (selected == question().optInt("a")) score++;
        } else if (questionIndex + 1 == questions().length()) phase = RESULT;
        else { questionIndex++; selected = -1; checked = false; }
        save(); render();
    }

    private void result() {
        LinearLayout panel = card(WHITE);
        sceneImage(panel, "scene-5", "The finished coffee", 190);
        TextView summary = title((advanced() ? "正解数  " : "Quiz score  ") + score + " / " + questions().length(), 26);
        pad(summary, 16, 16);
        add(panel, summary, 0);
        footer(advanced() ? "もう一度練習する" : "Practice again", true, () -> {
            sceneIndex = 0; phase = STORY; resetQuiz(); save(); render(); playBarista();
        });
    }
}
