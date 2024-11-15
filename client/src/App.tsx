import TextEditor from './TextEditor';
import { BrowserRouter as Router, Route, Navigate, Routes  } from 'react-router-dom';
import { v4 } from 'uuid';
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/documents/${v4()}`} replace/>} />
        <Route  path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
