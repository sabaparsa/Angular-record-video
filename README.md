# Record video in Angular11

In this project i used MediaDevices.getUserMedia() to record video in Angular projects.
The MediaDevices.getUserMedia() method prompts the user for permission to use a media input which produces a MediaStream with tracks containing the requested types of media. That stream can include, for example, a video track (produced by either a hardware or virtual video source such as a camera, video recording device, screen sharing service, and so forth), an audio track (similarly, produced by a physical or virtual audio source like a microphone, A/D converter, or the like), and possibly other track types.

It returns a Promise that resolves to a MediaStream object. If the user denies permission, or matching media is not available, then the promise is rejected with NotAllowedError or NotFoundError respectively.

## HTML Template
```
<div class="record-video-btn">
  <button type="button" (click)="recordHandlre()" [style.background-color]="recordButtonColor">{{ videoButtonTitle
    }}</button>
</div>

<div class="record-video-container">
  <video [hidden]="!isCapturingVideo" id="preview" autoplay muted #preview muted="muted" class="video"></video>
  <video [hidden]="isCapturingVideo" controls #recording class="video"></video>
</div>
```

The first video tag is the preview of the recording video and the second one is used to show recorded video.

## Ts file
```
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
declare var MediaRecorder: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  
  @ViewChild('preview', {static: false}) public previewElement!: ElementRef;
  @ViewChild('recording', {static: false}) public recordingElement!: ElementRef;
  public videoButtonTitle: string = "Start Recording";
  public isCapturingVideo: boolean = false;
  public videoContraints = {
    audio: true,
    video: { facingMode: "user" }
  }
  public isVideoTaken: boolean = false;
  public videoFile!: File;
  public recordButtonColor: string = "blueviolet";

  constructor(
    private renderer: Renderer2,

  ) { 
     
  }

  recordHandlre(): void {

    if (this.videoButtonTitle === "Start Recording" || this.videoButtonTitle === "Record Again") {
      this.isCapturingVideo = true;
      this.recordButtonColor = "red";
      this.startRecording();

    } else if (this.videoButtonTitle === "Stop Recording") {
      this.recordButtonColor = "blueviolet";
      this.stop(this.previewElement.nativeElement.srcObject);
    }

  }

  startRecording(): void {
    navigator.mediaDevices.getUserMedia(this.videoContraints).then((stream) => { this.bindStream(stream) })
      .then(() => this.startRecordingVideo(this.previewElement.nativeElement.captureStream()))
      .then((recordedChunks) => { this.recordChunks(recordedChunks) });
  }

  bindStream(stream: any) {
    this.previewElement.nativeElement.muted = true;
    this.renderer.setProperty(this.previewElement.nativeElement, 'srcObject', stream);
    this.previewElement.nativeElement.captureStream =
      this.previewElement.nativeElement.captureStream || this.previewElement.nativeElement.mozCaptureStream;
    return new Promise((resolve) => (this.previewElement.nativeElement.onplaying = resolve));

  }

  startRecordingVideo(stream: any) {

    this.videoButtonTitle = "Stop Recording";
    let recorder = new MediaRecorder(stream);
    let data: any = [];

    recorder.ondataavailable = (event: any) => data.push(event.data);
    recorder.start();

    let stopped = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = (event: any) => reject(event);
    });

    let recorded =
      () => recorder.state == "recording" && recorder.stop();

    this.isVideoTaken = true;
    return Promise.all([stopped, recorded]).then(() => data);
  }

  recordChunks(recordedChunks: any) {
    let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
    this.renderer.setProperty(this.recordingElement.nativeElement, 'src', URL.createObjectURL(recordedBlob));
    this.videoFile = this.blobToFile(recordedBlob, "user-video.mp4");
  }

  blobToFile = (theBlob: Blob, fileName: string): File => {
    //create a file
    var b: any = theBlob;
    b.lastModifiedDate = new Date();
    b.name = fileName;

    return <File>theBlob;
  }


  stop(stream: any) {

    stream.getTracks().forEach(function(track: any) {
      track.stop();
    });
    this.videoButtonTitle = "Record Again";
    this.isCapturingVideo = false;
  }
}

```

## Convert blob to file 
```
  blobToFile = (theBlob: Blob, fileName: string): File => {
    //create a file from blob
    var b: any = theBlob;
    b.lastModifiedDate = new Date();
    b.name = fileName;

    return <File>theBlob;
  }
```
In case you want to convert the recorded blob to file 

