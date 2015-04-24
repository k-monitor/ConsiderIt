####
# Form.coffee
#
# Components to help build forms.
#
require './shared'

window.Button = (props, text, callback) ->
  style =
    backgroundColor: focus_blue
    borderRadius: 8
    color: 'white'
    padding: '3px 10px'
    display: 'inline-block'
    fontWeight: 600
    textAlign: 'center'
    cursor: 'pointer'
  props.style = _.extend(style, (props.style or {}))
  props.onClick = callback

  DIV props, text


window.AutoGrowTextArea = ReactiveComponent
  displayName: 'AutoGrowTextArea'  

  # You can pass an onChange() handler in to props that will get
  # called
  onChange: (e) ->
    @props.onChange?(e)
    @checkAndSetHeight()

  componentDidMount : -> @checkAndSetHeight()
  componentDidUpdate : -> @checkAndSetHeight()

  checkAndSetHeight : ->
    scroll_height = @getDOMNode().scrollHeight
    max_height = @props.max_height or 600
    if scroll_height > @getDOMNode().clientHeight
      @local.height = Math.min scroll_height + 5, max_height
      save(@local)

  render : -> 
    if !@local.height
      @local.height = @props.min_height

    @transferPropsTo TEXTAREA
      onChange: @onChange
      style: {height: @local.height}


window.CharacterCountTextInput = ReactiveComponent
  displayName: 'CharacterCountTextInput'
  componentWillMount : -> fetch(@local_key).count = 0
  render : -> 
    class_name = "is_counted"
    DIV style: {position: 'relative'}, 
      @transferPropsTo TEXTAREA className: class_name, onChange: (=>
         @local.count = $(@getDOMNode()).find('textarea').val().length
         save(@local))
      SPAN className: 'count', @props.maxLength - @local.count



Quill = require './vendor/quill.js'

window.WysiwygEditor = ReactiveComponent
  displayName: 'WysiwygEditor'

  render : ->

    my_data = fetch @props.key
    subdomain = fetch '/subdomain'
    wysiwyg_editor = fetch 'wysiwyg_editor'

    if !@local.initialized
      # We store the current value of the HTML at
      # this component's key. This allows the  
      # parent component to fetch the value outside 
      # of this generic wysiwyg component. 
      # However, we "dangerously" set the html of the 
      # editor to the original @props.html. This is 
      # because we don't want to interfere with the 
      # wysiwyg editor's ability to manage e.g. 
      # the selection location. 
      my_data.html = @props.html
      @local.initialized = true
      save @local; save my_data

    toolbar_button_style = 
      cursor: 'pointer'
      padding: 8
      backgroundColor: 'white'
      color: '#414141'
      margin: '3px 3px'
      border: '1px solid #aaa'
      borderRadius: 3
      boxShadow: '0 1px 2px rgba(0,0,0,.2)'

    show_placeholder = (!my_data.html || (@editor?.getText().trim().length == 0)) && !!@props.placeholder

    DIV 
      id: @props.key
      style: @props.style
      onClick: (ev) -> 
        # Catch any clicks within the editor area to prevent the 
        # toolbar from being hidden via the root level 
        # show_wysiwyg_toolbar state
        ev.stopPropagation()

      if @local.edit_code
        AutoGrowTextArea
          style: 
            width: '100%'
            fontSize: 18
          defaultValue: fetch(@props.key).html
          onChange: (e) => 
            my_data = fetch(@props.key)
            my_data.html = e.target.value
            save my_data

      else

        # Toolbar
        [DIV 
          id: 'toolbar'
          style: 
            position: 'fixed'
            top: 0
            backgroundColor: '#e7e7e7'
            boxShadow: '0 1px 2px RGBA(0,0,0,.2)'
            zIndex: 999
            padding: '0 12px'
            display: if wysiwyg_editor.showing == @props.key then 'block' else 'none'

          I 
            className: "ql-bullet fa fa-list-ul"
            style: toolbar_button_style
            title: 'Bulleted list'

          I 
            className: "ql-list fa fa-list-ol"
            style: toolbar_button_style
            title: 'Numbered list'

          I 
            className: "ql-bold fa fa-bold"
            style: toolbar_button_style
            title: 'Bold'

          I 
            className: "ql-link fa fa-link"
            style: toolbar_button_style
            title: 'Link'

          # I 
          #   className: "ql-image fa fa-image"
          #   style: toolbar_button_style
          #   title: 'Insert image'

          if fetch('/current_user').is_super_admin
            I
              className: 'fa fa-code'
              style: toolbar_button_style
              onClick: => @local.edit_code = true; save @local


        DIV 
          id: 'editor'
          dangerouslySetInnerHTML:{__html: @props.html}
          'data-placeholder': if show_placeholder then @props.placeholder else ''
          onFocus: => 
            # Show the toolbar on focus
            # showing is global state for the toolbar to be 
            # shown. It gets set to null when someone clicks outside the 
            # editor area. This is handled at the root level
            # in the same way that clicking outside a point closes it. 
            # See Root.resetSelection.
            wysiwyg_editor = fetch 'wysiwyg_editor'
            wysiwyg_editor.showing = @props.key
            save wysiwyg_editor
        ]

  componentDidMount : -> 
    # Attach the Quill wysiwyg editor
    @editor = new Quill $(@getDOMNode()).find('#editor')[0],    
      modules: 
        toolbar: 
          container: $(@getDOMNode()).find('#toolbar')[0]
        'link-tooltip': true
        'image-tooltip': true
      styles: true #if/when we want to define all styles, set to false

    @editor.on 'text-change', (delta, source) => 
      my_data = fetch @props.key
      my_data.html = @editor.getHTML()

      if source == 'user' && my_data.html.indexOf(' style') > -1
        # strip out any style tags the user may have pasted into the html
        removeStyles = (el) ->
          el.removeAttribute 'style'
          if el.childNodes.length > 0
            for child in el.childNodes
              removeStyles child if child.nodeType == 1

        node = $(my_data.html)[0]
        removeStyles node
        @editor.setHTML $(node).html()
        return # the above line will trigger this text-change event 
               # again, w/o the style html

      save my_data

# Some overrides to Quill base styles
styles += """
html .ql-container{
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  padding: 0;
  overflow-x: visible;
  overflow-y: visible;
}
.ql-container:after{
  content: attr(data-placeholder);
  left: 0;
  top: 0;
  position: absolute;
  color: #aaa;
  pointer-events: none;
  z-index: 1;
}
"""
