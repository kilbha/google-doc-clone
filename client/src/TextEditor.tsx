import { useCallback, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import "../src/Styles.css";
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { useParams } from 'react-router-dom';

function TextEditor() {
    const {id:documentId } = useParams();
    const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
    const [quill, setQuill] = useState<Quill | undefined>(undefined);


    // Saving document
    useEffect(() => {
        if(socket == null || quill == null) return 

        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents())
        },2000)

        return () => {
            clearInterval(interval);
        }

    },[socket,quill])

    useEffect(() => {
        if(socket == null && quill == null) return
        
        socket?.once("load-document", document => {
            quill?.setContents(document);
            quill?.enable();
        })
        socket?.emit('get-document', documentId);
        

    },[socket, quill,documentId])

    useEffect(() => {
        const s = io("http://localhost:3001")
        setSocket(s);
        return () => {
            s.disconnect();
        }
    },[])

    useEffect(() => {
        if(socket == null || quill == null) return 
       const handler = (delta: any, oldDelta: any, source: string) => {
        if ( source !== 'user') return 
        socket.emit("send-changes", delta);
       }
       quill.on("text-change",handler) 

       return () => {
        quill?.off('text-change', handler);
       }
    },[socket, quill])

    useEffect(() => {
        if(socket == null || quill == null) return 
       const handler = (delta: any) => {        
        quill.updateContents(delta);
       }
       socket.on("receive-changes",handler) 

       return () => {
        socket.off('receive-changes', handler);
       }
    },[socket, quill])

    const modules = {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{align:[]}],
          [{list:'ordered'},{list:'bullet'}],
          [{indent:'+1'},{indent:'-1'}],
          // [{size:['small', false, 'large', 'huge']}],
          [{header:[1,2,3,4,5,6,false]}],
          ['link'], //  'image','video'
          [{color:[]},{background:[]}],
          ['clean']      
      ]}
  
    const wrapperRef = useCallback((wrapper:any) => {
        const editor = document.createElement('div');
        if(wrapper == null) return 
        wrapper.innerHTML = "";
        wrapper.append(editor);
        const q = new Quill(editor,{theme:'snow',modules:modules});
        q.disable();
        q.setText("Loading...");
        setQuill(q);
    },[])
  
  return (
    <div id="editor" ref={wrapperRef}></div>
  )
}

export default TextEditor


