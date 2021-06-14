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
    //create a file from blob
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
