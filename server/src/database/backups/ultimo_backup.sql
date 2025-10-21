--
-- PostgreSQL database dump
--

\restrict djc9sJnOhXD04SukzTbB1DL7PKlQevw6aZI3cSpuIoRquDYC3EEc8tt7rqTF1iZ

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-29 17:08:42

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4791 (class 0 OID 16559)
-- Dependencies: 218
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, apellido, celular, correo, contrasena, fecha_creacion, verificado, token_verificacion, token_expira, ultimo_acceso) FROM stdin;
1	Yesid	Maldonado	3203639836	yesidcarvajal2006@gmail.com	$2b$12$x74b/R9Fw20ymLrkSTNR7u29PyfTdEwbx3CHjdAJ4GZHOoOuGkqqS	2025-09-23 21:08:01.431404	t	\N	\N	2025-09-23 21:09:03.809663
\.
--
-- Datos para la tabla usuarios
--

COPY public.usuarios (id, nombre, apellido, celular, correo, contrasena, rol, verificado, token_verificacion, token_expira, fecha_creacion, ultimo_acceso) FROM stdin;
1   Yesid   Maldonado   3203639836  yesidcarvajal2006@gmail.com $2b$12$x74b/R9Fw20ymLrkSTNR7u29PyfTdEwbx3CHjdAJ4GZHOoOuGkqqS    estudiante  t   \N  \N  2025-09-23 21:08:01.431404  2025-09-23 21:09:03.809663
\.

--
-- Datos para la tabla estudiantes
--

COPY public.estudiantes (cedula_id, usuario_id, programa, creditos_aprobados, modulo_empleabilidad) FROM stdin;
1234567890  1   Ingeniería de Software  90  t
\.


--
-- TOC entry 4797 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, true);


-- Completed on 2025-09-29 17:08:43

--
-- PostgreSQL database dump complete
--

\unrestrict djc9sJnOhXD04SukzTbB1DL7PKlQevw6aZI3cSpuIoRquDYC3EEc8tt7rqTF1iZ

