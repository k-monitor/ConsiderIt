require './customizations'

####
# t()
#
# language appropriate string for a given string identifier
#
# label is an identifier for the string to be fetched. Will
# look label up in the respective language's dictionary defined
# below.
#
# args is optional object that will be passed onto the label
#
window.t = (label, args) -> 
  lang = customization('lang') # get the language defined for this subdomain

  if !dict[lang]?
    throw "Sorry, don't support language #{lang}"

  dictionary = dict[lang]

  label = label.replace(/\ /g, '_').toLowerCase()

  if !dictionary[label]?
    throw "Can't translate #{label} for language #{lang}"

  if typeof(dictionary[label]) == 'function'
    dictionary[label](args)
  else 
    dictionary[label]


##### 
# Dict will hold all the different translations for each language, 
#  i.e. dict.en, dict.spa, etc
# Each language's dict will have entries for every possible label that the 
# system needs to have a translation for. The entry can be a simple string, 
# or a function that will be passed arguments from t(). 

dict = {}


################
# Translation guidelines: 
#   - Try to make the translation roughly the same
#     number of characters as the english version, to prevent 
#     weird layout issues. I know this won't always be possible!


# Idea: Instead of defining everything here, it might be better to have 
#       each module/component define its own translations, and register them 
#       with the translation system. That might lead to a better development
#       experience when writing code, as the strings are all defined locally.
#       On the other hand, having all translations in a single file might 
#       make it easier to ask others to add/update necessary translations.  


#########
# General
dict.en = 
  or: 'or'
  and: 'and'

  done: 'Done'
  cancel: 'cancel'
  edit: 'edit'
  share: 'share'
  delete: 'delete'
  close: 'close'
  update: 'Update'
  publish: 'Publish'
  closed: 'closed'
  add_new: 'add new'


dict.spa = 
  or: 'ó'

  # Alejandro, please translate:
  and: 'y'
  done: 'Hecho'
  cancel: 'cancelar'
  edit: 'editar'
  share: 'compartir'
  delete: 'eliminar'
  close: 'cerrar'
  update: 'Actualizar'
  publish: 'Publicar'
  closed: 'cerrado'
  add_new: 'crear nueva'




#########
# Considerit opining

_.extend dict.en, 
  comment: 'comment'
  comments: 'comments'
  read_more: 'read more'
  select_these_opinions: 'Select these opinions'
  prev: 'prev'
  next: 'next'
  drag_from_left: (args) ->
    "Drag a #{args.noun} from the left"
  drag_from_right: (args) -> 
    "Drag a #{args.noun} from the right"
  write_a_new_point: (args) -> 
    "Write a new #{args.noun}"    

  slide_your_overall_opinion: 'Slide Your Overall Opinion'
  your_opinion: "Your opinion"
  save_your_opinion: 'Save your opinion'
  return_to_results: 'Return to results'
  skip_to_results: 'or just skip to the results'
  login_to_comment: 'Log in to write a comment'
  login_to_add_new: 'Log in to add new'
  discuss_this_point: 'Discuss this Point'
  save_comment: 'Save comment'
  write_a_comment: 'Write a comment'
  write_a_point: 'Write a point'
  summary_placeholder: 'A succinct summary of your point.'
  description_placeholder: 'Add background or evidence.'
  sign_name: 'Sign your name'

  tip_single: (args) -> 
    "Make one single point. Add multiple #{args.noun} if you have more."
  tip_direct: "Be direct. The summary is your main point."
  tip_review: "Review your language. Don’t be careless."
  tip_attacks: "No personal attacks."

  filter_to_watched: "Filter proposals to those you're watching"

_.extend dict.spa, 
  comment: 'comentario'
  comments: 'comentarios'
  read_more: 'ver más'
  select_these_opinions: 'Selecciona estas opiniones'
  prev: 'anterior'
  next: 'siguiente'
  drag_from_left: (args) ->
    return "Arrastra un #{args.noun} de la izquierda"

  drag_from_right: (args) ->
    return "Arrastra un #{args.noun} de la derecha"

  write_a_new_point: (args) ->
    return "Escribe un nuevo #{args.noun}"

  # Alejandro, please translate:
  slide_your_overall_opinion: 'Desliza Tu Opinión General'
  your_opinion: "Tu opinión"
  save_your_opinion: 'Guarda tu opinión'
  return_to_results: 'Volver a los resultados'
  skip_to_results: 'o ir directamente a los resultados'
  login_to_comment: 'Inicia sesión para comentar'
  login_to_add_new: 'Inicia sesión para crear nueva'
  discuss_this_point: 'Debatir este Punto'
  save_comment: 'Guardar comentario'
  write_a_comment: 'Escribir comentario'
  write_a_point: 'Escribir un punto de vista'
  summary_placeholder: 'Un breve resumen de tu punto de vista.'
  description_placeholder: 'Añadir antecedentes o pruebas'
  sign_name: 'Firmar con tu nombre'
  tip_single: (args) -> 
    "Escribe una única opinión. Añade multiples #{args.noun} si tienes más."
  tip_direct: "Se directo. El resumen será tu punto de vista principal."
  tip_review: "Revisa tu lenguaje. No seas descuidado."
  tip_attacks: "No ataques personales."
  filter_to_watched: "Filtrar propuestas por las que estás observando"

#########
# Creating proposal


_.extend dict.en, 
  create_new_proposal: 'Create new proposal'
  error_free: "free of language errors"
  unambiguous: 'unambiguous'
  make_it: 'Make it'
  url_instr: "Just letters, numbers, underscores, dashes."
  summary: 'Summary'
  proposal_summary_instr: 'Aim for 3-8 words with a verb and noun.'
  details: 'Details'
  label: 'Label'
  expandable_body_instr: 'Text that is shown when expanded'
  add_expandable: "Add expandable description section"
  category: 'Category'
  optional: 'optional'
  show_on_homepage: 'List on homepage?'
  open_for_discussion: 'Open for discussion?'
  permissions_and_invites: 'Permissions and invitations'

# Alejandro, please translate:
_.extend dict.spa, 
  create_new_proposal: 'Crear nueva propuesta'
  error_free: "libre de errores ortográficos"
  unambiguous: 'sin ambiguedades'
  make_it: 'Hazlo'
  url_instr: "Solo letras, numeros, subrayados, guiones."
  summary: 'Resumen'
  proposal_summary_instr: 'Que sean 3-8 palabras con un verbo y un sustantivo.'
  details: 'Detalles'
  label: 'Etiqueta'
  expandable_body_instr: 'Texto mostrado al expandir'
  add_expandable: "Añadir una sección de descripción expandible"
  category: 'Categoría'
  optional: 'opcional'
  show_on_homepage: '¿Mostrar en portada?'
  open_for_discussion: '¿Abierta a debate?'
  permissions_and_invites: 'Permisos e invitaciones'



########
# authentication / user account related translations

_.extend dict.en, 
  log_in: 'Log in'
  create_new_account: 'Create new account'
  log_out: 'Log out'
  edit_profile: 'Edit Profile'
  email_settings: 'Email Settings'
  introduce_yourself: 'Introduce Yourself'

  complete_registration: 'Complete registration'
  login_as: 'Hi, I log in as'
  password: 'password'
  name_prompt: 'My name is'
  full_name: 'first and last name'
  pic_prompt: 'I look like'
  your_profile: 'Your Profile'
  updated_successfully: "Updated successfully"
  reset_your_password: "Reset Your Password"
  code: 'Code'
  new_password: 'New password'
  verification_sent: 'We sent you a verification code via email.'
  verify: 'Verify'
  choose_password: "choose a new password"
  code_from_email: 'verification code from email'
  verify_your_email: 'Verify Your Email'
  more_info: 'Please give some info'
  forgot_password: 'I forgot my password!'


_.extend dict.spa, 
  log_in: 'Entrar'
  create_new_account: 'Registrarse'
  log_out: 'Salir'
  edit_profile: 'Editar Perfil'
  email_settings: 'Configuración de Email'
  introduce_yourself: 'Descríbete'

  # Alejandro, please translate:
  complete_registration: 'Completar registro'
  login_as: 'Hola, inicio sesión como'
  password: 'contraseña'
  name_prompt: 'Mi nombre es'
  full_name: 'nombre completo'
  pic_prompt: 'mi foto'
  your_profile: 'Tu Perfil'
  updated_successfully: "Actualizado correctamente"
  reset_your_password: "Reestablecer Contraseña"
  code: 'Codigo'
  new_password: 'Nueva contraseña'
  verification_sent: 'Te hemos enviado un código de verificación via email.'
  verify: 'Verificar'
  choose_password: "elige una nueva contraseña"
  code_from_email: 'código de verificación recibido'
  verify_your_email: 'Verifica Tu Email'
  more_info: 'Por favor, proporciona alguna información'
  forgot_password: '¡He olvidado mi contraseña!'


########
# email notification settings

_.extend dict.en, 

  send_email: 'Send me email digests'
  email_digest_purpose: (args) ->
    "The digests summarize relevant new activity for you regarding #{args.project}"
  digest_timing: "Send summaries at most"
  daily: 'daily'
  hourly: 'hourly'
  weekly: 'weekly'
  monthly: 'monthly'
  notable_events: "Emails are only sent if a notable event occurred. Which events are notable to you?"
  watched_proposals: 'The proposals you are watching for new activity:'
  unwatch: "Unwatch this proposal"
  hide_notifications: 'Hide notifications'
  show_notifications: 'Show notifications'
  commented_on: "commented on"
  your_point: 'your point'
  edited_proposal: 'edited this proposal'
  added_new_point: 'added a new point'
  added_opinion: 'added their opinion'


# Alejandro, please translate:
_.extend dict.spa, 
  send_email: 'Envíame resúmenes por correo electrónico'
  email_digest_purpose: (args) ->
    "Los resumenes proporcionan información de actividad sobre #{args.project}"
  digest_timing: "Envíame resúmenes como máximo"
  daily: 'diariamente'
  hourly: 'cada hora'
  weekly: 'semanalmente'
  monthly: 'mensualmente'
  notable_events: "Los Emails únicamente se envían si ocurre algo importante. ¿Qué eventos son importantes para tí?"
  watched_proposals: 'Las propuestas que estás observando:'
  unwatch: "Dejar de seguir esta propuesta"
  hide_notifications: 'Ocultar notificaciones'
  show_notifications: 'Mostrar notificaciones'
  commented_on: "comentado"
  your_point: 'tu punto de vista'
  edited_proposal: 'ha editado esta propuesta'
  added_new_point: 'ha añadido un nuevo punto de vista'
  added_opinion: 'ha añadido su opinión'


# fill in missing spanish translations with english equivalents
_.defaults dict.spa, dict.en