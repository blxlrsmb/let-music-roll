# Let Music Roll
This is a project for HackShanghai hackathon held in 11/15-11/16, 2014, developed by:
+ ppwwyyxx
+ zxytim
+ vuryleo
+ zbwmqlw

It is a web service which automatically analyses the music you upload,
and show you an exciting, colorful 3D tour which visualizes the music as you listen.
Sorry that we didn't have a working online system for now, since the backend
requires pretty much computing resources to work well. We will work on it later.

# How it works

### Beat Detection:
Use Harmonic-Percussive Source Separation(HPSS), and detect beats from percussive.

### Emotion Analysis:
Arousal/valence are two commonly used metrics for emotion detection.
We trained a model to predict music arousal/valence with various signal features and
gradient boosting trees. Our model gave good performance on "Emotion in Music" public dataset.
See "Presentation.pdf" for details.

### Visualization:
A/V values of the uploaded music at each time are predicted at the
backend, and sent back to the frontend together with the detected beats of the music.
Frontend uses the analysis to render a fantastic 3D tour based on Light.js and Three.js, which will spark as the
music beats, and change activities as the music gets more/less exciting.

# Dependencies
+ scikit-learn
+ scikits.samplerate
+ librosa
+ Bregman
+ Flask
+ Light.js
+ Highcharts.js
+ Three.js

# Run
```
cd emotion-model
./run_music_analyze_server.py server-conf.py
```
