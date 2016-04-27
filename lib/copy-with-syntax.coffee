CopyWithSyntaxView = require './copy-with-syntax-view'
{CompositeDisposable} = require 'atom'
XYZ = require './stuff'

module.exports = CopyWithSyntax =
  copyWithSyntaxView: null
  modalPanel: null
  subscriptions: null

  activate: (state) ->
    @copyWithSyntaxView = new CopyWithSyntaxView(state.copyWithSyntaxViewState)
    @modalPanel = atom.workspace.addModalPanel(item: @copyWithSyntaxView.getElement(), visible: false)

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'copy-with-syntax:toggle': => @toggle()

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @copyWithSyntaxView.destroy()

  serialize: ->
    copyWithSyntaxViewState: @copyWithSyntaxView.serialize()

  toggle: ->
    console.log 'CopyWithSyntax was toggled!'
    XYZ()

    # if @modalPanel.isVisible()
    #   @modalPanel.hide()
    # else
    #   @modalPanel.show()
