*Backend Twitter NodeJS*


*Enviroments (.env)*
    El puerto en el cual se ejecutará el proyecto y la
    URL de la base de datos debe de definirse en el 
    archivo .env.
    Ejemplo: 

        *PORT = 3300*
        *MONGO_URL = 'mongodb://localhost:27017/Twitter-BE'*

*Rutas*

    -En postman la URL debe ser:
    (El puerto y el nombre de la base de datos
     puede ser el de su preferencia)  
    *localhost:3300/twitter*
    
    Este proyecto está diseñado para usar una sola ruta, por lo tanto en el body de
    postman debe ir lo siguiente:

    - |Key| commands.
    - |Value| Dependerá de lo que se desee hacer.

        |Agregar Usuario| *register* luego iría *nombre correo usuario contraseña*
            *register admin admin@admin admin admin*
            
        |Login de un usuario| *login* luego iría *usuario contraseña* o también *correo contraseña*
            *login admin admin* o también *admin@admin admin*.
            Para que me en los parámetro de vuelta nos de el token debemos de 
            agregar *true* luego de la contraseña.

            *login admin admin true* o también *admin@admin admin true*
        |Agregar tweet a un usuario| *add_tweet* luego va el contenido del tweet.
            *add_tweet tweet de ejemplo*.

        |Editar tweet de un usuario| *edit_tweet* luego va el nuevo contenido del tweet.
            *edit_tweet tweet del nuevo contenido*.

        |Agregar un tweet a un usuario| *set_tweet* luego va el ID del usuario.
            *set_tweet ID_000_DE_000_EJEMPLO*.

        |Eliminar un tweet| *delete_tweet* luego va el ID del tweett.
            *delete_tweet ID_000_DE_000_EJEMPLO*.

        |Visualizar los tweets de un usuario| **view_tweets** luego va el usuario.
            *view_tweets ejemplo_de_usuario*.

        |Seguir a un usuario| *follow* luego va el usuario.
            *follow ejemplo ejemplo_de_usuario*.

        |Dejar de seguir a un usuario| *unfollow* luego va el usuario.
            *unfollow ejemplo_de_usuario*.

        |Perfil de un usuario| *profile* luevo va el usuario.
            *profile ejemplo_de_usuario*.

        |Like a un tweet| *like* luego va el ID del tweet.
            *like ID_000_DE_000_EJEMPLO*.

        |Dislike a un tweet| *dislike* luego va el ID del tweet.
            *dislike ID_000_DE_000_EJEMPLO*.
            
        |Retweet a un tweet| *retweet* luego va el ID del tweet y opcionalmente si desea 
            agregar un comentario.
            *retweet ID_000_DE_000_EJEMPLO*
            *retweet ID_0000_DE_0000_EJEMPLO ejemplo_de_comentario*