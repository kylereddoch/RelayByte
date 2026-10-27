// Original RelayByte motion badge. Run npm run film:render on macOS.
import AppKit
import AVFoundation
import CoreVideo
import CoreImage
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let width = 1920, height = 1080, fps: Int32 = 30
let duration = 12.0, frameCount = 360
let space = CGColorSpace(name: CGColorSpace.sRGB)!
let media = root.appendingPathComponent("src/assets/media"), output = root.appendingPathComponent("output/film")
try FileManager.default.createDirectory(at: media, withIntermediateDirectories: true)
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
func color(_ n:UInt32,_ a:CGFloat=1)->NSColor { NSColor(srgbRed:CGFloat((n>>16)&255)/255,green:CGFloat((n>>8)&255)/255,blue:CGFloat(n&255)/255,alpha:a) }
let orange=color(0xef623f), paper=color(0xf4f2ed), ink=color(0x151718)
let mark=NSImage(contentsOf:root.appendingPathComponent("src/assets/brand/relaybyte-symbol-orange-1024.png"))!.cgImage(forProposedRect:nil,context:nil,hints:nil)!
let ci=CIContext(options:[.workingColorSpace:space,.outputColorSpace:space])
func context(_ w:Int=1920,_ h:Int=1080)->CGContext { CGContext(data:nil,width:w,height:h,bitsPerComponent:8,bytesPerRow:w*4,space:space,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)! }
func text(_ str:String,_ x:CGFloat,_ y:CGFloat,_ size:CGFloat,_ c:NSColor=paper,_ weight:NSFont.Weight = .regular) {
 (str as NSString).draw(at:CGPoint(x:x,y:y),withAttributes:[.font:NSFont.systemFont(ofSize:size,weight:weight),.foregroundColor:c,.kern: size > 40 ? -1.5 : 0.5])
}
func centered(_ str:String,_ y:CGFloat,_ size:CGFloat,_ c:NSColor=paper,_ weight:NSFont.Weight = .regular) {
 let attr:[NSAttributedString.Key:Any]=[.font:NSFont.systemFont(ofSize:size,weight:weight),.foregroundColor:c,.kern:size > 40 ? -1.5 : 0.5]
 let w=(str as NSString).size(withAttributes:attr).width
 (str as NSString).draw(at:CGPoint(x:(1920-w)/2,y:y),withAttributes:attr)
}
func badgeTexture(edge:Bool=false)->CIImage {
 let ctx=context(900,930)
 let shape=CGPath(roundedRect:CGRect(x:5,y:5,width:890,height:920),cornerWidth:68,cornerHeight:68,transform:nil)
 ctx.addPath(shape);ctx.clip()
 if edge { ctx.setFillColor(orange.cgColor);ctx.fill(CGRect(x:0,y:0,width:900,height:930)) }
 else {
   let grad=CGGradient(colorsSpace:space,colors:[color(0x323735).cgColor,color(0x171a19).cgColor] as CFArray,locations:[0,1])!
   ctx.drawLinearGradient(grad,start:CGPoint(x:0,y:930),end:CGPoint(x:750,y:0),options:[.drawsBeforeStartLocation,.drawsAfterEndLocation])
   ctx.setStrokeColor(color(0xffffff,0.025).cgColor);ctx.setLineWidth(1)
   for x in stride(from:0,through:900,by:60) {ctx.move(to:CGPoint(x:x,y:0));ctx.addLine(to:CGPoint(x:x,y:930));ctx.strokePath()}
   for y in stride(from:0,through:930,by:60) {ctx.move(to:CGPoint(x:0,y:y));ctx.addLine(to:CGPoint(x:900,y:y));ctx.strokePath()}
   ctx.draw(mark,in:CGRect(x:48,y:60,width:804,height:804))
   ctx.addPath(CGPath(roundedRect:CGRect(x:8,y:8,width:884,height:914),cornerWidth:65,cornerHeight:65,transform:nil));ctx.setLineWidth(2);ctx.setStrokeColor(color(0xffffff,0.20).cgColor);ctx.strokePath()
   NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=NSGraphicsContext(cgContext:ctx,flipped:false)
   text("RELAYBYTE",53,840,20,color(0xc1c5c1),.medium)
   text("INDEPENDENT SOFTWARE",53,51,17,color(0x9da39f),.medium)
   text("RB / 01",723,51,17,color(0x9da39f),.medium)
   NSGraphicsContext.restoreGraphicsState()
 }
 return CIImage(cgImage:ctx.makeImage()!)
}
let face=badgeTexture(), edge=badgeTexture(edge:true)
func smooth(_ x:Double)->Double {let p=max(0,min(1,x));return p*p*p*(p*(p*6-15)+10)}
// Perspective projection of a real 3D slab: yaw, a slight pitch, then the homepage's relaxed tilt.
func project(_ x:Double,_ y:Double,_ z:Double,_ yaw:Double)->CGPoint {
 let xx=x*cos(yaw)+z*sin(yaw), zz = -x*sin(yaw)+z*cos(yaw)
 let pitch = -0.07, roll=0.105
 let yy=y*cos(pitch)-zz*sin(pitch), depth=y*sin(pitch)+zz*cos(pitch)
 let rx=xx*cos(roll)-yy*sin(roll), ry=xx*sin(roll)+yy*cos(roll)
 let perspective=1900/(1900-depth)
 return CGPoint(x:1410+rx*perspective,y:552+ry*perspective)
}
func plane(_ ctx:CGContext,_ texture:CIImage,_ yaw:Double,_ z:Double,_ back:Bool=false) {
 let left:Double=back ? 292 : -292, right = -left
 let corners=["inputTopLeft":project(left,302,z,yaw),"inputTopRight":project(right,302,z,yaw),"inputBottomRight":project(right,-302,z,yaw),"inputBottomLeft":project(left,-302,z,yaw)]
 let warped=texture.applyingFilter("CIPerspectiveTransform",parameters:corners.mapValues { CIVector(cgPoint:$0) })
 let bounds=warped.extent.integral
 if bounds.width > 1, let img=ci.createCGImage(warped,from:bounds) {ctx.draw(img,in:bounds)}
}
func frame(_ ctx:CGContext,_ t:Double) {
 NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=NSGraphicsContext(cgContext:ctx,flipped:false)
 ctx.setFillColor(ink.cgColor);ctx.fill(CGRect(x:0,y:0,width:1920,height:1080))
 let glow=CGGradient(colorsSpace:space,colors:[color(0x653422,0.28).cgColor,color(0x151718,0).cgColor] as CFArray,locations:[0,1])!
 ctx.drawRadialGradient(glow,startCenter:CGPoint(x:1410,y:550),startRadius:0,endCenter:CGPoint(x:1410,y:550),endRadius:720,options:[])
 // The scene and first/last frames match exactly; only the badge and its reflection move.
 ctx.setStrokeColor(color(0xffffff,0.065).cgColor);ctx.setLineWidth(1)
 for radius:CGFloat in [360,420] {ctx.strokeEllipse(in:CGRect(x:1410-radius,y:550-radius,width:radius*2,height:radius*2))}
 let phase=smooth((t-0.5)/4.5), yaw=phase*Double.pi*2-0.14
 let shadowWidth:CGFloat=310+CGFloat(abs(cos(yaw)))*220
 ctx.saveGState();ctx.setShadow(offset:.zero,blur:25,color:color(0,0.5).cgColor);ctx.setFillColor(color(0,0.22).cgColor);ctx.fillEllipse(in:CGRect(x:1410-shadowWidth/2,y:192,width:shadowWidth,height:22));ctx.restoreGState()
 // Paint depth slices from far to near for the orange beveled edge.
 let layers=cos(yaw) >= 0 ? Array(stride(from:-7.0,through:7.0,by:2.0)) : Array(stride(from:7.0,through:-7.0,by:-2.0))
 for z in layers {plane(ctx,edge,yaw,z)}
 let isBack=cos(yaw)<0
 // A moving studio highlight is composited in texture space before perspective projection.
 let shineX=450+350*sin(yaw)
 let shine=CIFilter(name:"CILinearGradient",parameters:["inputPoint0":CIVector(x:shineX-250,y:900),"inputPoint1":CIVector(x:shineX+250,y:0),"inputColor0":CIColor(red:1,green:1,blue:1,alpha:0.075),"inputColor1":CIColor(red:1,green:1,blue:1,alpha:0)])!.outputImage!.cropped(to:face.extent)
 let lit=shine.applyingFilter("CISourceAtopCompositing",parameters:[kCIInputBackgroundImageKey:face])
 plane(ctx,lit,yaw,isBack ? -8 : 8,isBack)
 // A stable information panel stays readable throughout the turn.
 ctx.draw(mark,in:CGRect(x:90,y:924,width:65,height:65))
 text("RelayByte",166,936,32,paper,.semibold)
 text("INDEPENDENT SOFTWARE",110,812,18,orange,.medium)
 text("Good software.",104,690,88,paper,.semibold)
 text("Less friction.",104,588,88,orange,.semibold)
 text("Thoughtful tools for everyday life.",110,526,28,color(0xb9bdb6))
 text("Independently built.",110,358,36,paper,.medium)
 text("Carefully considered.",110,303,36,color(0xb9bdb6),.medium)
 ctx.setStrokeColor(color(0xffffff,0.13).cgColor);ctx.move(to:CGPoint(x:110,y:157));ctx.addLine(to:CGPoint(x:830,y:157));ctx.strokePath()
 text("relaybyte.dev",110,103,25,paper,.medium)
 NSGraphicsContext.restoreGraphicsState()
}
func save(_ ctx:CGContext,_ url:URL) throws {try NSBitmapImageRep(cgImage:ctx.makeImage()!).representation(using:.jpeg,properties:[.compressionFactor:0.93])!.write(to:url)}
for (i,t) in [0.0,1.85,2.75,3.65,11.99].enumerated() {let ctx=context();frame(ctx,t);try save(ctx,output.appendingPathComponent("badge-\(i+1).jpg"));if i==0 {try save(ctx,media.appendingPathComponent("relaybyte-film-poster.jpg"))}}
if CommandLine.arguments.contains("--stills") {print("Saved five badge views and poster.");exit(0)}
let target=output.appendingPathComponent("relaybyte-film.mp4")
if FileManager.default.fileExists(atPath:target.path) {try FileManager.default.removeItem(at:target)}
let writer=try AVAssetWriter(outputURL:target,fileType:.mp4);writer.shouldOptimizeForNetworkUse=true
let input=AVAssetWriterInput(mediaType:.video,outputSettings:[AVVideoCodecKey:AVVideoCodecType.h264,AVVideoWidthKey:width,AVVideoHeightKey:height,AVVideoCompressionPropertiesKey:[AVVideoAverageBitRateKey:4_000_000,AVVideoProfileLevelKey:AVVideoProfileLevelH264HighAutoLevel,AVVideoMaxKeyFrameIntervalKey:30]])
let adaptor=AVAssetWriterInputPixelBufferAdaptor(assetWriterInput:input,sourcePixelBufferAttributes:[kCVPixelBufferPixelFormatTypeKey as String:kCVPixelFormatType_32ARGB,kCVPixelBufferWidthKey as String:width,kCVPixelBufferHeightKey as String:height,kCVPixelBufferCGImageCompatibilityKey as String:true,kCVPixelBufferCGBitmapContextCompatibilityKey as String:true])
writer.add(input);guard writer.startWriting() else {throw writer.error!};writer.startSession(atSourceTime:.zero)
for f in 0..<frameCount {
 while !input.isReadyForMoreMediaData {if writer.status == .failed {throw writer.error!};Thread.sleep(forTimeInterval:0.002)}
 try autoreleasepool {
   var pixel:CVPixelBuffer?;guard CVPixelBufferPoolCreatePixelBuffer(nil,adaptor.pixelBufferPool!,&pixel)==kCVReturnSuccess,let buffer=pixel else {fatalError("Pixel allocation failed")}
   CVPixelBufferLockBaseAddress(buffer,[])
   let ctx=CGContext(data:CVPixelBufferGetBaseAddress(buffer),width:width,height:height,bitsPerComponent:8,bytesPerRow:CVPixelBufferGetBytesPerRow(buffer),space:space,bitmapInfo:CGImageAlphaInfo.noneSkipFirst.rawValue)!
   frame(ctx,Double(f)/Double(fps));CVPixelBufferUnlockBaseAddress(buffer,[])
   guard adaptor.append(buffer,withPresentationTime:CMTime(value:Int64(f),timescale:fps)) else {throw writer.error!}
 };if f%60==0 {print("Rendered \(f)/\(frameCount) frames");fflush(stdout)}
}
input.markAsFinished();writer.endSession(atSourceTime:CMTime(seconds:duration,preferredTimescale:fps))
let done=DispatchSemaphore(value:0);writer.finishWriting {done.signal()};done.wait();guard writer.status == .completed else {throw writer.error!}
try Data(contentsOf:target).write(to:media.appendingPathComponent("relaybyte-film.mp4"),options:.atomic)
print("Complete: 12-second split-layout badge loop, 1920×1080, 30 fps, H.264.")
