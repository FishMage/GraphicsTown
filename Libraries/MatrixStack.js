var MatrixStack = function () {

	this.matrix = mat4.create();
	this.stack = [];

	mat4.identity(this.matrix);

	this.push = function () {
		this.stack.push(mat4.clone(this.matrix))
	}

	this.pop = function () {
		this.matrix = this.stack.pop();
	}
}