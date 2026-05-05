import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AuthContext from '../../AuthContext';
import newRequest from '../../utils/newRequest';
import './ExpertDashboard.scss';