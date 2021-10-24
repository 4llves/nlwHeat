defmodule ElixirHeatWeb.MessagesView do
  use ElixirHeatWeb, :view

  def render("create.json", %{message: message}) do
    %{
      result: "message created!",
      message: message
    }
  end
end
