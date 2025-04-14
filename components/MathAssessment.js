'use client'


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';

// Get API URLs from environment variables with fallbacks
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-9899.up.railway.app';
const LEARNING_PATH_URL = process.env.NEXT_PUBLIC_LEARNING_PATH_URL || 'http://localhost:5173';

const BackgroundRadarChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  // Transform the collected_data into the format needed by RadarChart
  const chartData = Object.entries(data).map(([skill, values]) => ({
    skill,
    mastery: values.mastery,
    confidence: values.confidence * 100, // Convert confidence to percentage
  }));

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none opacity-50">
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <div className="w-[200%] h-[200%] max-w-none">
          <RadarChart width={1800} height={1800} data={chartData} className="blur-[2px]">
            <PolarGrid 
              gridType="polygon" 
              stroke="rgba(200, 200, 200, 0.3)" 
              strokeWidth={1.5} 
            />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={false} // No text but keep the axis
              axisLine={{ stroke: 'rgba(200, 200, 200, 0.15)', strokeWidth: 2 }}
            />
            <PolarRadiusAxis 
              tick={false} 
              axisLine={false}
              domain={[0, 100]} 
              stroke="rgba(200, 200, 200, 0.15)" 
            />
            
            <Radar
              name="Mastery"
              dataKey="mastery"
              stroke="rgb(255, 167, 0)"
              fill="rgb(255, 167, 0)"
              fillOpacity={0.2}
              strokeWidth={2.5}
            />
            
            <Radar
              name="Confidence"
              dataKey="confidence"
              stroke="rgb(6, 182, 212)"
              fill="rgb(6, 182, 212)"
              fillOpacity={0.2}
              strokeWidth={2.5}
            />
          </RadarChart>
        </div>
      </div>
    </div>
  );
};

const SkillsRadarChart = ({ data, isOpen, toggleOpen }) => {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  // Transform the collected_data into the format needed by RadarChart
  const chartData = Object.entries(data).map(([skill, values]) => ({
    skill,
    mastery: values.mastery,
    confidence: values.confidence * 100, // Convert confidence to percentage
  }));

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button 
        onClick={toggleOpen} 
        className="mb-2 ml-auto block bg-[#eea40b]"
        size="sm"
      >
        {isOpen ? "Hide Skills" : "Show Skills"}
      </Button>
      
      {isOpen && (
        <Card className="w-[350px] p-4 shadow-lg bg-white/90 backdrop-blur">
          <CardHeader className="p-2">
            <CardTitle className="text-center text-lg font-forum">Skill Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={chartData} outerRadius={90}>
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} />
                
                <Radar
                  name="Mastery"
                  dataKey="mastery"
                  stroke="#eea40b"
                  fill="#eea40b"
                  fillOpacity={0.5}
                />
                
                <Radar
                  name="Confidence"
                  dataKey="confidence"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.5}
                />
                
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const MathAssessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [childInfo, setChildInfo] = useState({
    parent_name: '',
    name: '',
    age: '',
  });
  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isRadarChartOpen, setIsRadarChartOpen] = useState(false);
  
  // New state variables for learning path generation
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [configString, setConfigString] = useState(null);
  const [pathError, setPathError] = useState(null);

  const toggleRadarChart = () => {
    setIsRadarChartOpen(!isRadarChartOpen);
  };

  // Function to create learning path
  const createLearningPath = async () => {
    if (!currentQuestion || !currentQuestion.collected_data) {
      setPathError('No assessment data available');
      return;
    }

    setIsGeneratingPath(true);
    setPathError(null);

    try {
      // Convert the collected_data to a JSON string
      const diagnosticResultsJson = JSON.stringify(currentQuestion.collected_data);
      
      const response = await fetch(`${API_URL}/create_learning_path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diagnostic_results: diagnosticResultsJson
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse the config string from the response
      const configRegex = /<config_string>(.*?)<\/config_string>/s;
      const configMatch = configRegex.exec(JSON.stringify(data.config));
      
      if (configMatch && configMatch[1]) {
        setConfigString(configMatch[1]);
      } else {
        setPathError('Could not find config string in the response');
      }
    } catch (error) {
      console.error('Error creating learning path:', error);
      setPathError(`Failed to create learning path: ${error.message}`);
    } finally {
      setIsGeneratingPath(false);
    }
  };

  // Navigate to the config page
  const navigateToConfig = () => {
    if (configString) {
      window.location.href = `${LEARNING_PATH_URL}/?config=${encodeURIComponent(configString)}`;
    }
  };

  // Effect to automatically create learning path when assessment is complete
  useEffect(() => {
    if (currentQuestion && currentQuestion.assessment_completion === 100) {
      createLearningPath();
    }
  }, [currentQuestion, createLearningPath]);

  const startAssessment = async () => {
    setLoading(true);
    setError(null);

    const initialMessage = {
      role: "user",
      content: `Меня зовут ${childInfo.parent_name}. Моему ребенку ${childInfo.age} лет, зовут ${childInfo.name}.`
    };

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: [initialMessage]
        }),
      });

      const data = await response.json();

      // Safely parse `response.content` into a usable object
      let parsedContent;
      try {
        parsedContent = JSON.parse(data.response.content);
      } catch (parseError) {
        console.error('Error parsing response content:', parseError);
        setError('Failed to parse the response from the server.');
        setLoading(false);
        return;
      }

      // Create the assistant message
      const assistantMessage = {
        role: "assistant",
        content: data.response.content
      };

      setCurrentQuestion(parsedContent);
      // Save both the initial message and the assistant's response
      setMessageHistory([initialMessage, assistantMessage]);
      setIsAssessmentStarted(true);
    } catch (error) {
      console.error('Error starting assessment:', error);
      setError('Failed to start assessment. Please try again.');
    }
    setLoading(false);
  };

  const handleAnswer = async (answer) => {
    setLoading(true);
    const answerMessage = {
      role: "user",
      content: answer
    };

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: [...messageHistory, answerMessage]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create the assistant message
        const assistantMessage = {
          role: "assistant",
          content: data.response.content
        };

        // Update message history with both the user's answer and assistant's response
        setMessageHistory(prev => [...prev, answerMessage, assistantMessage]);

        // Parse the content for the question display
        let parsedContent;
        try {
          parsedContent = typeof data.response.content === 'string' 
            ? JSON.parse(data.response.content)
            : data.response.content;
        } catch (parseError) {
          console.error('Error parsing response content:', parseError);
          setError('Failed to parse the response from the server.');
          setLoading(false);
          return;
        }

        setCurrentQuestion(parsedContent);
      }
    } catch (error) {
      console.error('Error sending answer:', error);
      setError('Failed to submit answer. Please try again.');
    }
    setLoading(false);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-4xl p-8 space-y-8 text-gray-800">
          <h1 className="text-3xl font-forum mb-6 leading-relaxed">Здравствуйте</h1>
          
          <div className="space-y-8">
            <p className="text-lg leading-relaxed">
              Эта вводная диагностика поможет нам вместе построить самый эффективный путь для развития вашего ребенка. 
              Сессия займёт около 30 минут.
            </p>
            
            <div>
              <h2 className="text-3xl font-forum mb-4 leading-relaxed">
                Несколько важных моментов:
              </h2>
              <div className="text-lg space-y-6">
                <p className="leading-relaxed">
                  Пожалуйста, выберите спокойное время и место, где ребёнок чувствует себя комфортно. 
                </p>
                <p className="leading-relaxed">
                  Ваша роль невероятно важна: вы будете проводником между AI и ребёнком.<br/>
                  Главное - быть внимательным наблюдателем и честно отмечать ответы.
                </p>
                <p className="leading-relaxed">
                  И самое важное: пожалуйста, воздержитесь от подсказок и помощи с решением. 
                  Мы знаем, как хочется помочь, но именно понимание реального уровня знаний 
                  позволит нам создать идеальный план обучения, персонально для вашего ребёнка.
                </p>
                <p className="leading-relaxed">
                  Начните с лёгкой беседы, спросите как прошёл день, что интересного сегодня случилось. 
                  Когда почувствуете, что ребёнок расслаблен и готов - можем начинать.
                </p>
              </div>
            </div>
            
            <div className="font-forum text-center pt-4">
              <Button 
                onClick={() => setShowWelcome(false)} 
                className="px-8 py-3 text-lg leading-relaxed bg-[#eea40b] text-white"
              >
                Начать
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAssessmentStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-2xl p-8 space-y-6 text-gray-800">
          <h2 className="text-3xl mb-6 font-forum leading-relaxed">Как к вам обращаться?</h2>
          
          <div className="space-y-2">
            <Label htmlFor="parent_name" className="text-lg leading-relaxed">Ваше имя</Label>
            <Input
              id="parent_name"
              value={childInfo.parent_name}
              onChange={(e) => setChildInfo(prev => ({...prev, parent_name: e.target.value}))}
              className="border focus:ring-2 text-lg leading-relaxed"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg leading-relaxed">Имя ребенка</Label>
            <Input
              id="name"
              value={childInfo.name}
              onChange={(e) => setChildInfo(prev => ({...prev, name: e.target.value}))}
              className="border focus:ring-2 text-lg leading-relaxed"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age" className="text-lg leading-relaxed">Возраст ребенка</Label>
            <Input
              id="age"
              value={childInfo.age}
              onChange={(e) => setChildInfo(prev => ({...prev, age: e.target.value}))}
              type="number"
              className="border focus:ring-2 text-lg leading-relaxed"
            />
          </div>
          <Button 
            onClick={startAssessment} 
            className="w-full text-xl mt-6 font-forum leading-relaxed bg-[#eea40b] text-white"
            disabled={loading || !childInfo.name || !childInfo.age || !childInfo.parent_name}
          >
            {loading ? 'Загрузка...' : 'Дальше'}
          </Button>
          {error && <p className="text-red-400 text-center text-lg leading-relaxed">{error}</p>}
        </div>
      </div>
    );
  }

  if (loading && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <Card className="w-full max-w-2xl bg-white text-gray-800">
          <CardContent className="p-6">
            <p className="text-center">Загрузка вопроса...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <Card className="w-full max-w-2xl bg-white text-gray-800">
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={startAssessment}
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion || !currentQuestion.possible_answers) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      {currentQuestion.collected_data && (
        <>
          <BackgroundRadarChart data={currentQuestion.collected_data} />
          <SkillsRadarChart 
            data={currentQuestion.collected_data} 
            isOpen={isRadarChartOpen}
            toggleOpen={toggleRadarChart}
          />
        </>
      )}

      <div className="w-full max-w-2xl mx-auto p-8 space-y-6 text-gray-800 relative z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
        
        <div className="space-y-6">
          <div>
            {currentQuestion.assessment_completion === 100 ? (
              <div>
                <h2 className="text-xl font-forum leading-relaxed">Спасибо! <br/> <br/>{currentQuestion.final_summary}</h2>
                <div className="mt-8">
                  {isGeneratingPath ? (
                    <div className="text-center">
                      <p className="text-lg mb-4">Генерация персонализированного плана обучения...</p>
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#eea40b]"></div>
                      </div>
                    </div>
                  ) : pathError ? (
                    <div className="text-center">
                      <p className="text-red-500 mb-4">{pathError}</p>
                      <Button 
                        onClick={createLearningPath}
                        className="px-6 py-2 bg-[#eea40b] text-white"
                      >
                        Попробовать снова
                      </Button>
                    </div>
                  ) : configString ? (
                    <div className="text-center">
                      <p className="text-lg mb-4">Ваш персонализированный план обучения готов!</p>
                      <Button 
                        onClick={navigateToConfig}
                        className="px-6 py-2 bg-[#eea40b] text-white"
                      >
                        Посмотреть план обучения
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <h2 className="text-2xl font-forum leading-relaxed">{currentQuestion.instruction} </h2>
            )}
          </div>

          <div className="space-y-3">
              {currentQuestion.assessment_completion !== 100 && Object.entries(currentQuestion.possible_answers).map(([key, value]) => (
              <Button
                key={key}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 border hover:bg-[#eea40b] text-gray-800 text-sm leading-relaxed"
                onClick={() => handleAnswer(key)}
                disabled={loading}
              >
                <span className="font-medium"></span>
                {value}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {/* <Progress 
            value={currentQuestion.assessment_completion || 0} 
            className="w-full"
          /> */}
        </div>
      </div>
    </div>
  );
};

export default MathAssessment;

