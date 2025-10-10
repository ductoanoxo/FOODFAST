import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { store } from './redux/store'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={viVN} theme={{
        token: {
          colorPrimary: '#ff4d4f',
        },
      }}>
        <App />
      </ConfigProvider>
    </Provider>
  </StrictMode>,
)
