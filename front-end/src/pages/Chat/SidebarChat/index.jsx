import "./style.css";
import jwt from 'jwt-decode';
import apiRequest from "../../../services/api.js";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import isAuthenticated from "../../../isAuth";
import { SocketContext } from "../../../context/Socket";
import React from "react";
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from "@mui/icons-material/Person";
import DensityMediumIcon from '@mui/icons-material/MoreVert';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export default function SidebarChat() {
  const [usuario, setUsuario] = useState({});
  const [token, setToken] = useState('');
  const [chats, setChats] = useState([])
  const [fotosUsuarios, setFotoUsuarios] = useState({})
  const socket = useContext(SocketContext);
  const [showMenu, setShowMenu] = useState({});
  const [optionSidebar, setOptionSidebar] = useState(false)


  useEffect(() => {
    setToken(document.cookie.replace(/(?:(?:^|.*;\s*)jwt\s*\=\s*([^;]*).*$)|^.*$/, '$1'))
  }, [])

  const getUsuario = async () => {
    const idUsuario = jwt(token).secret.id
    await apiRequest
      .get(`/usuario/${idUsuario}`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        setUsuario(response.data);
      })
      .catch((err) => {
        console.error("ops! ocorreu um erro" + err);
      });
  }

  useEffect(() => {
    if(usuario){
      socket.on("atualizarSidebar", (data) => {
        setChats((prevChats) => [data, ...prevChats]);
      })
    }
  }, [])

  useEffect(() => {
    if(chats.length > 0){
      socket.on("atualizarSidebarMensagens", (idChat) => {
        //acessar chats._id e jogar pra cima
        const index = chats.findIndex(e => e._id === idChat);
        const temp = chats[index]
        if(index > -1){
          chats.splice(index, 1)
        }
        setChats((prevChats) => [temp, ...chats]);
      })
    }
  }, [chats])

  const getFotos = async () => {
    await apiRequest
      .get('/usuario', {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        const objectData = {}
        response.data.map(e => {
          objectData[`${e._id}`] = e.foto
        })
        setFotoUsuarios(objectData)
      })
      .catch((err) => {
        console.error("ops! ocorreu um erro" + err);
      });
  }

  useEffect(() => {
    if (token && usuario) {
      getUsuario()
      getFotos()
    }
  }, [token])

  const ordenaChat = (data) => {
    data.sort((a, b) => {
      const lastMessageA = a.mensagens[a.mensagens.length - 1];
      const lastMessageB = b.mensagens[b.mensagens.length - 1];
      
      if(lastMessageA && lastMessageB){
        const dateA = new Date(lastMessageA.horario);
        const dateB = new Date(lastMessageB.horario);
        return dateB - dateA;
      }
      
    })
    return data
  }

  useEffect(() => {
    if (usuario && token) {
      apiRequest
        .post("/chat", { chats: usuario.chats }, {
          headers: {
            Authorization: "Bearer " + token,
          }
        })
        .then(response => {
          let chats = ordenaChat(response.data)
          setChats(chats)
        })
        .catch(error => {
          console.log(error)
        })
    }
  }, [usuario])

  const limparNotificacao = (idChat, notificacao) => {
    const idUser = usuario._id
    socket.emit("limparNotificacao", ({ idChat: idChat, idUser: idUser, notificacao: notificacao }))
    getUsuario()
  }

  useEffect(() => {
    if(chats){
      console.log(chats)
    }
  }, [chats])

  return token && usuario && chats && (
    <div className="containerSidebar">
      <div className="headerSidebar">
        <div onClick={() => { setOptionSidebar(false) }}>
          Conversas
        </div>
        <div onClick={() => { setOptionSidebar(true) }}>
          Ver arquivados
        </div>
      </div>
      {!optionSidebar && chats.map((chat, index) => {
        return (
          <div className="index"
            key={index}
          >
            <Link
              to={ // quando clicar levar pra pergunta específica
                isAuthenticated()
                  ? `/chat/${chat._id}`
                  : "/login"
              }
              onClick={() => {
                if (chat.privado) {
                  let verificaNotificacao = (chat.usuarios[0].user.id == jwt(token).secret.id ?
                    chat.usuarios[0].user.notificacoes :
                    chat.usuarios[0].userTarget.notificacoes)
                  if (verificaNotificacao) {
                    limparNotificacao(chat._id, verificaNotificacao)
                  }
                }
              }}
            >
            
              {chat.privado && (
                <div className="sidebarItemChat">
                  <div className ="sidebarDate">
                    {chat.privado && (
                      <>
                        {chat.usuarios[0].user.id === jwt(token).secret.id ? (
                          chat.usuarios[0].userTarget.id in fotosUsuarios ? (
                            <img
                              id="imagemPerfilChatS"
                              src={fotosUsuarios[chat.usuarios[0].userTarget.id]}
                              alt="imagemPerfil"
                            />
                          ) : (
                            <PersonIcon />
                          )
                        ) : (
                          chat.usuarios[0].user.id in fotosUsuarios ? (
                            <img
                              id="imagemPerfilChatS"
                              src={fotosUsuarios[chat.usuarios[0].user.id]}
                              alt="imagemPerfil"
                            />
                          ) : (
                            <PersonIcon />
                          )
                        )}
                      </>
                    )}
                    {chat.usuarios[0].user.id === jwt(token).secret.id
                      ? chat.usuarios[0].userTarget.nome
                      : chat.usuarios[0].user.nome}

                    <div>
                      {chat.usuarios[0].user.id === jwt(token).secret.id ?
                        chat.usuarios[0].user.notificacoes > 0 && <span className="notificacao" >{chat.usuarios[0].user.notificacoes}</span> :
                        chat.usuarios[0].userTarget.notificacoes > 0 && <span className="notificacao" >{chat.usuarios[0].userTarget.notificacoes}</span>
                      }
                    </div>
                  </div>  
                </div>
            
            )}
            
            

            {!chat.privado && <div className="sidebarItemChat"><div className="iconeSala">{<GroupsIcon style={{ fontSize: '40px' }} />}</div>{
              chat.nome}</div>}
          </Link>
            <div>
              <DensityMediumIcon className="densityMediumIcon"
                onClick={(e) => {
                  e.preventDefault(e);
                  setShowMenu((prevShowMenu) => ({
                    ...prevShowMenu,
                    [chat._id]: !prevShowMenu[chat._id],
                  }));
                }}
              />

              {showMenu[chat._id] && (
                <div className="deleteForeverIcon"
                  onClick={() => {
                    console.log(chat._id)
                  }}
                >
                  <center><DeleteForeverIcon />  </center>Excluir
                </div>
              )}
            </div>          
          </div>
        );
      })}
    </div>
    
    
  );
}