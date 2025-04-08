import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientsView from './ClientsView';
import ClientActivitiesView from './ClientActivitiesView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClientsView />} />
        <Route path="/activities/:clientId" element={<ClientActivitiesView />} />
      </Routes>
    </Router>
  );
}

export default App;
