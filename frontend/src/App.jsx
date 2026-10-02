import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import QuestionInput from './components/QuestionInput';
import SampleQuestions from './components/SampleQuestions';
import AnswerCard from './components/AnswerCard';
import CypherCard from './components/CypherCard';
import ResultsTable from './components/ResultsTable';
import GraphViewer from './components/GraphViewer';
import StatsCard from './components/StatsCard';
import BananaVerification from './components/BananaVerification';
import EntitiesView from './components/EntitiesView';
import ApiTestingView from './components/ApiTestingView';
import AboutView from './components/AboutView';
import apiService from './services/api';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('ask');

  const [neo4jStatus, setNeo4jStatus] = useState('checking');
  const [apiStatus, setApiStatus] = useState('checking');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stats, setStats] = useState(null);
  const [bananaNodes, setBananaNodes] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [entities, setEntities] = useState({});
  const [dataLoading, setDataLoading] = useState(false);

  const [question, setQuestion] = useState('Which Samsung products are supplied by TechWorld?');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [queryResult, setQueryResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const fetchAllData = async () => {
    setIsRefreshing(true);
    setDataLoading(true);

    try {
      await apiService.getHealth();
      setApiStatus('online');
    } catch (e) {
      setApiStatus('offline');
    }

    try {
      const n4j = await apiService.getNeo4jHealth();
      setNeo4jStatus(n4j.status === 'connected' ? 'connected' : 'disconnected');
    } catch (e) {
      setNeo4jStatus('disconnected');
    }

    try {
      const s = await apiService.getStats();
      setStats(s);
    } catch (e) {
      console.error('Failed to load stats', e);
    }

    try {
      const b = await apiService.getBananaNodes();
      setBananaNodes(b);
    } catch (e) {
      console.error('Failed to load banana nodes', e);
    }

    try {
      const g = await apiService.getGraphData();
      setGraphData(g);
    } catch (e) {
      console.error('Failed to load graph visualization data', e);
    }

    try {
      const ent = await apiService.getEntities();
      setEntities(ent);
    } catch (e) {
      console.error('Failed to load entities', e);
    }

    setIsRefreshing(false);
    setDataLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAskQuestion = async (customQ) => {
    const qToAsk = customQ || question;
    if (!qToAsk || !qToAsk.trim()) {
      setError('Please enter a question before submitting.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingStep(0);

    const step1Timer = setTimeout(() => setLoadingStep(1), 350);
    const step2Timer = setTimeout(() => setLoadingStep(2), 700);
    const step3Timer = setTimeout(() => setLoadingStep(3), 1100);

    try {
      const res = await apiService.askQuestion(qToAsk.trim());
      setQueryResult(res);
      setActiveTab('ask');
    } catch (err) {
      console.error('Ask question failed', err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to execute question retrieval pipeline.';
      setError(msg);
    } finally {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const handleSelectSample = (sampleText) => {
    setQuestion(sampleText);
    handleAskQuestion(sampleText);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          isDark={isDark}
          setIsDark={setIsDark}
          neo4jStatus={neo4jStatus}
          apiStatus={apiStatus}
          onRefresh={fetchAllData}
          isRefreshing={isRefreshing}
        />

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'ask' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Question Input */}
              <QuestionInput
                question={question}
                setQuestion={setQuestion}
                onSubmit={() => handleAskQuestion()}
                isLoading={isLoading}
                loadingStep={loadingStep}
                error={error}
              />

              {/* Sample Questions */}
              <SampleQuestions onSelectQuestion={handleSelectSample} />

              {/* Results Section */}
              {queryResult && (
                <div className="space-y-6">
                  {/* AI Answer Card */}
                  <AnswerCard
                    answer={queryResult.answer}
                    grounded={queryResult.grounded}
                    resultCount={queryResult.result_count}
                  />

                  {/* Generated Cypher Card */}
                  <CypherCard cypher={queryResult.cypher} />

                  {/* Retrieved Graph Data Card */}
                  <ResultsTable results={queryResult.results} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'graph' && (
            <div className="max-w-6xl mx-auto">
              <GraphViewer graphData={graphData} isLoading={dataLoading} />
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="max-w-6xl mx-auto">
              <EntitiesView entities={entities} isLoading={dataLoading} />
            </div>
          )}

          {activeTab === 'samples' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <SampleQuestions onSelectQuestion={handleSelectSample} />
              {queryResult && (
                <div className="space-y-6">
                  <AnswerCard
                    answer={queryResult.answer}
                    grounded={queryResult.grounded}
                    resultCount={queryResult.result_count}
                  />
                  <CypherCard cypher={queryResult.cypher} />
                  <ResultsTable results={queryResult.results} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <StatsCard stats={stats} isLoading={dataLoading} />
            </div>
          )}

          {activeTab === 'banana' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <BananaVerification
                bananaNodes={bananaNodes}
                isLoading={dataLoading}
                onRefresh={fetchAllData}
              />
            </div>
          )}

          {activeTab === 'api' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <ApiTestingView />
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <AboutView />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
