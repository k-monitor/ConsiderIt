for el of React.DOM
  this[el.toUpperCase()] = React.DOM[el]

window.parse_key = (key) ->
  word = "([^/]+)"
  # Matching things like: "/new/name/number"
  # or:                   "/name/number"
  # or:                   "/name"
  # or:                   "name/number"
  # or:                   "name"
  # ... and you can optionally include a final slash.
  regexp = new RegExp("(/)?(new/)?#{word}(/#{word})?(/)?")
  m = key.match(regexp)
  if not m
    return null

  [has_match, server_owned, is_new, name, tmp1, number, tmp2] = m
  owner = if server_owned then 'server' else 'client'
  return has_match and {owner, 'new': is_new, name, number}

window.StateDash = ReactiveComponent
  displayName: 'State Dash'
  render: ->
    dash = @fetch('state_dash')
    
    if dash.filter?.match(/idkfa/) or dash.filter?.match(/idmap/)
      dash.on = false
      dash.filter = ''
      save(dash)

    if not dash.on
      return DIV null, ''

    url_tree = (cache) ->
      # The key tree looks like:
      #
      # {server: {thing: [obj1, obj2], shing: [obj1, obj2], ...}
      #  client: {dong: [obj1, ...]}}
      #
      # And objects without a number, like '/shong' will go on:
      #  key_tree.server.shong[null]
      tree = {server: {}, client: {}}
      
      add_key = (key) ->
        p = parse_key(key)
        if not p
          console.log('The state dash can\'t deal with key', key); return null

        tree[p.owner][p.name] ||= []
        tree[p.owner][p.name][p.number or null] = cache[key]

      for key of cache
        add_key(key)
      return tree

    search_results = @search_results()
    cache = search_results.matches
    tree = url_tree(cache)

    first_key = (cache) ->
      for key of cache
        reject_name = dash.selected.name and parse_key(key).name != dash.selected.name
        reject_numb = dash.selected.number and parse_key(key).number != dash.selected.number
        if !reject_name and !reject_numb
          return key
      return null

    best_guess = first_key(search_results.key_matches) or \
                 first_key(search_results.data_matches)

    cluster_rows = (keys) ->
      clusters = {}
      for key in keys
        fields = JSON.stringify(Object.keys(cache[key]))
        clusters[fields] = clusters[fields] or []
        clusters[fields].push(key)
      return clusters

    DIV className: 'state_dash', style: this.props.style,
      STYLE null,
        """
        .state_dash {
          position: absolute;
          margin: 20px;
          z-index: 10000;
        }
        .state_dash .left, .state_dash .right, .state_dash .top {
          background-color: #eee;
          overflow-wrap: break-word;
          padding: 10px;
          vertical-align: top;
        }
        .state_dash .left  { min-width:   40px; display: inline-block; }
        .state_dash .right { margin-left: 30px; display: inline-block; }
        .state_dash .top   { max-width:   100%; margin: 20px 0; }

        .string { color: green; }
        .number { color: darkorange; }
        .boolean { color: blue; }
        .null { color: magenta; }
        .key { color: red; }

        .cell {
          width: 150px;
          border: 1px solid grey;
          padding: 2px;
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: clip;
          margin: 0;
        }
        """

      # Render the top (name) menu
      DIV className: 'left', #onMouseLeave: reset_selection,
        INPUT (className: 'search', onChange: @filter_to, onMouseEnter: reset_selection)
        for owner in ['client', 'server']
          prefix = (owner == 'server') and '/' or ''
          DIV {key: owner},
            for name of tree[owner]
              do (owner, name) ->
                f = -> dash.selected={owner, name, number:null}; save(dash)
                style = (name == dash.selected.name) and {'background-color':'#aaf'} or {}
                DIV onMouseEnter: f, key: name, style: style,
                  prefix + name

      # Render the object
      # PRE className: 'right', ref: 'json_preview',
      #   JSON.stringify(arest.cache[best_guess], undefined, 3)
      DIV className: 'right',
        # Next: go through the list, cluster those that fit the same
        # schema, and display a table for each.
        if dash.selected.name
          selected_keys = (key for key of cache when parse_key(key).name == dash.selected.name)
          clusters = cluster_rows(selected_keys)
          for fieldset of clusters
            # Print each table
            DIV null,
              # Print the table header
              for field in JSON.parse(fieldset)
                DIV
                  key: field
                  style: {fontWeight: 'bold', borderColor: '#eee'}
                  className: 'cell'
                  field

              # Print the table body
              for key in clusters[fieldset]
                row = cache[key]
                DIV key: key,
                  for field of row
                    DIV
                      className: 'cell'
                      key: field
                      onClick: do (key, field) => (evt) =>
                        @local.editing = {key_:key, field:field}
                        save(@local)
                        setTimeout(=> @refs.dash_input.getDOMNode().focus())
                      if (@local.editing \
                          and @local.editing.key_ == key \
                          and @local.editing.field == field)
                        SPAN null,
                          TEXTAREA
                            key: field
                            type: 'text'
                            ref: 'dash_input'
                            defaultValue: JSON.stringify(row[field])
                            onChange: (event) =>
                              try
                                val = JSON.parse(@refs.dash_input.getDOMNode().value)
                                cache[@local.editing.key_][@local.editing.field] = val
                                save(cache[@local.editing.key_])
                                event.stopPropagation()

                                delete @local.editing.error; save(@local)
                              catch e
                                @local.editing.error = true; save(@local)
                            onBlur: (event) =>
                              delete @local.editing; save(@local)
                            style:
                              position: 'absolute'
                              backgroundColor: '#faa' if @local.editing.error
                          # INPUT
                          #   type: 'submit'
                          #   onClick: (event) =>
                          #     try
                          #       val = JSON.parse(@refs.dash_input.getDOMNode().value)
                          #       cache[@local.editing.key_][@local.editing.field] = val
                          #       save(cache[@local.editing.key_])
                          #       c = fetch('component/1')
                          #       delete c.editing
                          #       save(c)
                          #       event.stopPropagation()
                          #     catch e
                          #       @local.editing.error = true
                          #       save(@local)
                          #   style:
                          #     position: 'absolute'
                          #     marginTop: 30

                      JSON.stringify(row[field])


  # Other methods
  search_results: () ->
    # Returns two filtered views of the cache:
    # 
    #   { key_matches: {...a cache filtered to matching keys... }
    #     data_matches: {...a cache filtered to matching data...} }

    dash = fetch('state_dash')
    matches = {}
    key_matches = {}
    data_matches = {}
    if dash.filter
      for key of arest.cache
        if key.match(dash.filter)
          matches[key] = arest.cache[key]
          key_matches[key] = arest.cache[key]
        if JSON.stringify(arest.cache[key]).match(dash.filter)
          matches[key] = arest.cache[key]
          data_matches[key] = arest.cache[key]
    else
      matches = key_matches = data_matches = arest.cache

    return {matches, key_matches, data_matches}
  filter_to: (e) ->
    dash = @data('state_dash')
    dash.filter = e.target.value
    if dash.filter.length == 0
      dash.filter = null
    save(dash)
    true

  # componentDidUpdate: () ->
  #   el = @refs.json_preview.getDOMNode()
  #   el.innerHTML = rainbows(el.innerHTML)
reset_selection = () ->
  dash = fetch('state_dash')
  dash.selected = {owner: null, name: null, number: null}
  save(dash)

rainbows = (json) ->
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) ->
    cls = 'number'
    if (/^"/.test(match))
      if (/:$/.test(match))
        cls = 'key'
      else
        cls = 'string';
    else if (/true|false/.test(match))
      cls = 'boolean'
    else if (/null/.test(match))
      cls = 'null';
    
    return "<span class=\"#{cls}\">#{match}</span>")


fetch 'state_dash',
  on: false
  selected: {owner: null, name: null, number: null}
  filter: null

recent_keys = [0,0,0,0,0]

document.addEventListener "keypress", (e) -> 
  key = (e and e.keyCode) or e.keyCode
  recent_keys.push(key)
  recent_keys = recent_keys.slice(1)

  if key==4 or "#{recent_keys}" == "#{[105, 100, 109, 97, 112]}" \ # idmap
            or "#{recent_keys}" == "#{[105, 100, 107, 102, 97]}"   # idkfa
    dash = fetch('state_dash')
    if dash.on
      dash.on = false
    else
      dash.on = true
    save(dash)
    setTimeout(->$('.state_dash input').focus())

