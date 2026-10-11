const { UserService } = require('../src/userService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('retorna o usuário com os dados informados, status "ativo" e sem privilégio de admin por padrão', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario).toMatchObject({
        nome,
        email,
        idade,
        isAdmin: false,
        status: 'ativo',
      });
    });

    test('gera um id diferente para cada usuário criado', () => {
      // Arrange
      const primeiro = userService.createUser('Ana', 'ana@teste.com', 30);

      // Act
      const segundo = userService.createUser('Bia', 'bia@teste.com', 31);

      // Assert
      expect(segundo.id).not.toBe(primeiro.id);
    });

    test('lança erro ao criar usuário menor de idade', () => {
      // Arrange
      const criarMenorDeIdade = () =>
        userService.createUser('Menor', 'menor@teste.com', 17);

      // Act & Assert
      expect(criarMenorDeIdade).toThrow('O usuário deve ser maior de idade.');
    });

    test('lança erro quando um campo obrigatório não é informado', () => {
      // Arrange
      const criarSemEmail = () => userService.createUser('Sem Email', '', 30);

      // Act & Assert
      expect(criarSemEmail).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('retorna o usuário previamente criado', () => {
      // Arrange
      const criado = userService.createUser('Fulano', 'fulano@teste.com', 25);

      // Act
      const buscado = userService.getUserById(criado.id);

      // Assert
      expect(buscado).toEqual(criado);
    });

    test('retorna null para um id inexistente', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.getUserById(idInexistente);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('desativa um usuário comum', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
      expect(userService.getUserById(usuarioComum.id).status).toBe('inativo');
    });

    test('não desativa um usuário administrador', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
      expect(userService.getUserById(usuarioAdmin.id).status).toBe('ativo');
    });

    test('retorna false para um id inexistente', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('inclui id, nome e status de cada usuário cadastrado', () => {
      // Arrange
      const alice = userService.createUser('Alice', 'alice@teste.com', 28);
      const bob = userService.createUser('Bob', 'bob@teste.com', 32);
      userService.deactivateUser(bob.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(alice.id);
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain(bob.id);
      expect(relatorio).toContain('Bob');
      expect(relatorio).toContain('inativo');
    });

    test('informa que não há usuários quando o cadastro está vazio', () => {
      // Arrange: o beforeEach já garante um banco vazio

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toMatch(/nenhum usuário cadastrado/i);
    });
  });
});
