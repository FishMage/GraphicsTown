var group = LoadedOBJFiles["StreetLamp.obj"].groups["StreetLamp"];
var faces = group.faces;
var vertices = group.vertices;
var sum = [0, 0, 0], c = 0;

for(var i = 0;i<faces.length;i++){   //for each face
    var face = faces[i];
    for(var n = 0;n < face.length;n++){ //for each vertex
        var indices = face[n];
        var vertex = vertices[indices[0]] //get the vertex (indices[0] is position index)
        for(var j = 0;j < 3;j++){//for x, y, z in that vertex
            sum[j] += vertex[j]; //add to sum
        }
        c++;
    }

}

sum[0] /= c;
sum[1] /= c;
sum[2] /= c;
console.log(sum)