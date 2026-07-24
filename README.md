# Scalable Web App — Auth + Dashboard

## Overview
React + Vite frontend, Node + Express backend, MongoDB (Atlas/local). Features: JWT auth, Notes CRUD, search, profile, validations.

## Tech
- Frontend: React (Vite), Tailwind, axios, react-hook-form
- Backend: Node, Express, Mongoose
- DB: MongoDB (Atlas recommended)

## Local Setup

### Backend
1. `cd backend`
2. Copy `.env.example` → `.env` and fill:

MONGO_URI=...
JWT_SECRET=...
PORT=4000
FRONTEND_URL=http://localhost:5173

3. Install dependencies: `npm install`
4. Start in dev: `npm run dev`
5. Run tests: `npm test`

### Frontend
1. `cd frontend`
2. Copy `.env.example` → `.env` and fill:
VITE_API_URL=http://localhost:4000/api
3. Install deps: `npm install`
4. Start dev: `npm run dev`

## API Endpoints
- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login user
- `GET /api/profile/me` — get profile (auth)
- `PUT /api/profile` — update profile (auth)# Scalable Web Application with Centralized Logging (EFK Stack)

A production-inspired full-stack web application built using **React**, **Node.js**, **Express**, **MongoDB**, and **Kubernetes**, integrated with an **EFK (Elasticsearch, Fluentd, Kibana)** stack for centralized logging and monitoring.

---

# Table of Contents

- Project Overview
- Tech Stack
- Project Architecture
- Prerequisites
- Repository Structure
- Local Development Setup
- Docker Setup
- Kubernetes Deployment
- EFK Stack Setup
- Verifying the Logging Pipeline
- Accessing the Application
- Useful Kubernetes Commands
- Troubleshooting
- Future Improvements

---

# Project Overview

This project demonstrates the deployment of a scalable web application using Kubernetes while implementing centralized logging using the EFK stack.

Features include:

- JWT Authentication
- User Profile Management
- Notes CRUD Operations
- Search & Pagination
- MongoDB Database
- Kubernetes Deployment
- Centralized Logging using Elasticsearch, Fluentd and Kibana

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Hook Form

## Backend

- Node.js
- Express.js
- JWT Authentication
- Mongoose

## Database

- MongoDB

## DevOps

- Docker
- Docker Hub
- Kubernetes (Minikube)
- kubectl

## Monitoring & Logging

- Elasticsearch
- Fluentd
- Kibana

---

# Project Architecture

```
                    Browser
                       │
             React Frontend
                       │
                       ▼
              Backend API (Express)
                       │
                       ▼
                  MongoDB Database


----------------------------------------------

Application Logs
       │
       ▼
 Kubernetes Container Logs
       │
       ▼
     Fluentd
       │
       ▼
 Elasticsearch
       │
       ▼
     Kibana
```

---

# Prerequisites

Install the following before starting.

- Git
- Docker Desktop / Docker Engine
- Minikube
- kubectl
- Node.js (v18+ recommended)
- npm
- MongoDB Atlas Account (Optional if using Atlas)

Verify installations

```bash
docker --version

kubectl version --client

minikube version

node -v

npm -v
```

---

# Clone Repository

```bash
git clone <repository-url>

cd <repository-name>
```

---

# Repository Structure

```
project
│
├── backend
│
├── frontend
│
├── k8s
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── mongo-deployment.yaml
│   ├── mongo-service.yaml
│   ├── elasticsearch-deployment.yaml
│   ├── elasticsearch-service.yaml
│   ├── kibana-deployment.yaml
│   ├── kibana-service.yaml
│   ├── fluentd-daemonset.yaml
│   ├── fluentd-configmap.yaml
│   └── fluentd-rbac.yaml
│
└── README.md
```

---

# Local Development Setup

## Backend

Navigate to backend

```bash
cd backend
```

Copy

```
.env.example
```

to

```
.env
```

Update

```
MONGO_URI=
JWT_SECRET=
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Install dependencies

```bash
npm install
```

Run

```bash
npm run dev
```

Run tests

```bash
npm test
```

---

## Frontend

Navigate

```bash
cd frontend
```

Copy

```
.env.example
```

to

```
.env
```

Update

```
VITE_API_URL=http://localhost:4000/api
```

Install

```bash
npm install
```

Run

```bash
npm run dev
```

---

# Docker Setup

## Build Backend Image

```bash
docker build -t <dockerhub-username>/notes-backend ./backend
```

Push image

```bash
docker push <dockerhub-username>/notes-backend
```

Update the Kubernetes deployment file with your Docker image if required.

---

# Kubernetes Deployment

Start Minikube

```bash
minikube start
```

Verify cluster

```bash
kubectl cluster-info
```

Deploy MongoDB

```bash
kubectl apply -f mongo-deployment.yaml

kubectl apply -f mongo-service.yaml
```

Deploy Backend

```bash
kubectl apply -f backend-deployment.yaml

kubectl apply -f backend-service.yaml
```

Verify

```bash
kubectl get deployments

kubectl get services

kubectl get pods
```

Expected

```
backend

mongo
```

should be Running.

---

# Setting up the EFK Stack

The EFK stack provides centralized logging for all Kubernetes workloads.

---

## Step 1 — Deploy Elasticsearch

```bash
kubectl apply -f elasticsearch-deployment.yaml

kubectl apply -f elasticsearch-service.yaml
```

Verify

```bash
kubectl get pods

kubectl get svc
```

Port Forward

```bash
kubectl port-forward service/elasticsearch 9200:9200
```

Verify

```bash
curl localhost:9200
```

Expected

```
"You Know, for Search"
```

---

## Step 2 — Deploy Kibana

```bash
kubectl apply -f kibana-deployment.yaml

kubectl apply -f kibana-service.yaml
```

Port Forward

```bash
kubectl port-forward service/kibana 5601:5601
```

Open

```
http://localhost:5601
```

If prompted

- Configure Elastic
- Verify
- Create Data View
- Use

```
logstash*
```

Select

```
@timestamp
```

Finish.

---

## Step 3 — Configure RBAC

Fluentd requires Kubernetes API access.

Apply

```bash
kubectl apply -f fluentd-rbac.yaml
```

Verify

```bash
kubectl get serviceaccounts -A
```

Expected

```
fluentd
```

inside

```
kube-system
```

---

## Step 4 — Deploy Fluentd

Deploy ConfigMap

```bash
kubectl apply -f fluentd-configmap.yaml
```

Deploy DaemonSet

```bash
kubectl apply -f fluentd-daemonset.yaml
```

Verify

```bash
kubectl get daemonsets

kubectl get pods
```

Expected

```
fluentd
```

Running.

---

# Verifying the Logging Pipeline

## Check Elasticsearch

```bash
curl localhost:9200/_cat/indices?v
```

Expected

```
logstash-yyyy.mm.dd
```

indices.

---

## Verify Fluentd

```bash
kubectl logs -l app=fluentd
```

Ensure no Elasticsearch connection errors exist.

---

## Verify Backend Logs

```bash
kubectl logs deployment/backend
```

Generate traffic

```bash
curl http://localhost:<backend-port>/health
```

---

## Verify in Kibana

Open

```
http://localhost:5601
```

Go to

```
Discover
```

Search

```
kubernetes.container_name : backend
```

You should see

- Backend logs
- Kubernetes metadata
- Docker metadata
- Timestamps

This confirms

```
Backend

↓

Fluentd

↓

Elasticsearch

↓

Kibana
```

is functioning successfully.

---

# Accessing the Application

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:4000
```

Kibana

```
http://localhost:5601
```

Elasticsearch

```
http://localhost:9200
```

---

# Useful Kubernetes Commands

Pods

```bash
kubectl get pods
```

Services

```bash
kubectl get svc
```

Deployments

```bash
kubectl get deployments
```

Describe Pod

```bash
kubectl describe pod <pod-name>
```

Logs

```bash
kubectl logs <pod-name>
```

Delete Pods

```bash
kubectl delete pods --all
```

Restart Deployment

```bash
kubectl rollout restart deployment/backend
```

---

# Troubleshooting

## Backend CrashLoopBackOff

Check

```bash
kubectl logs <backend-pod>
```

Verify

- MongoDB URI
- Database availability
- Environment variables

---

## Elasticsearch Not Starting

Check

```bash
kubectl logs <elasticsearch-pod>
```

Verify

- Image
- Resources
- Volume mounts

---

## Fluentd Not Sending Logs

Verify

```bash
kubectl logs <fluentd-pod>
```

Check

- Elasticsearch host
- ConfigMap
- RBAC
- ServiceAccount

---

## Kibana Shows No Logs

Verify

```bash
curl localhost:9200/_cat/indices?v
```

Ensure

```
logstash*
```

exists.

Check Discover time range.

Filter

```
kubernetes.container_name : backend
```

---

# API Endpoints

Authentication

```
POST /api/auth/register

POST /api/auth/login
```

Profile

```
GET /api/profile/me

PUT /api/profile
```

Notes

```
GET /api/notes

POST /api/notes

GET /api/notes/:id

PUT /api/notes/:id

DELETE /api/notes/:id
```

---

# Deployment

Backend

- Render
- Railway

Required Environment Variables

```
MONGO_URI

JWT_SECRET

FRONTEND_URL
```

Frontend

- Vercel

Environment Variable

```
VITE_API_URL=https://backend-url/api
```

---

# Security

- JWT Authentication
- bcrypt Password Hashing
- Rate Limiting
- HTTPS Recommended
- Secure Cookies
- Input Validation
- Protected Routes

---

# Future Improvements

- Prometheus Monitoring
- Grafana Dashboards
- Helm Charts
- Kubernetes Ingress
- TLS Enabled Elasticsearch
- Persistent Volumes
- CI/CD using GitHub Actions
- Log Alerts
- Horizontal Pod Autoscaling

---

# Contributors

Developed as part of a Kubernetes and DevOps learning project demonstrating scalable application deployment and centralized logging using the EFK stack.
- `GET /api/notes?q=&page=&limit=&sort=` — list notes (auth)
- `POST /api/notes` — create note (auth)
- `GET /api/notes/:id` — get note (auth)
- `PUT /api/notes/:id` — update (auth)
- `DELETE /api/notes/:id` — delete (auth)

## Deployment
- Backend: Render / Railway — set `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL` as environment variables.
- Frontend: Vercel — set `VITE_API_URL` to backend URL (e.g. `https://your-backend.onrender.com/api`).

## Security Notes
- Passwords stored hashed with bcrypt.
- JWT short-lived; consider using refresh tokens.
- Rate limiting on auth endpoints.
- Use HTTPS and secure cookies in production.
